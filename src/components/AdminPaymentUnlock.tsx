"use client";

import { useMemo, useState } from "react";

type InvitationSummary = {
  slug: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  isPaid: boolean;
  shareUrlPath: string;
};

type AdminPreviewResponse = {
  summary?: InvitationSummary;
  message?: string;
};

type AdminUnlockResponse = {
  row?: {
    slug: string;
  };
  message?: string;
};

function parseCustomerEditLink(value: string) {
  try {
    const url = new URL(value.trim());
    const parts = url.pathname.split("/").filter(Boolean);
    const editIndex = parts.indexOf("edit");
    const slug = editIndex >= 0 ? parts[editIndex + 1] : "";
    const editSecret = url.searchParams.get("key") ?? url.searchParams.get("secret") ?? "";

    return {
      slug: slug ? decodeURIComponent(slug) : "",
      editSecret,
    };
  } catch {
    return {
      slug: "",
      editSecret: "",
    };
  }
}

function makeCustomerMessage(shareUrl: string, editUrl: string) {
  return [
    "결제 확인이 완료되어 모바일 청첩장 워터마크가 제거되었습니다.",
    "",
    `청첩장 공유 링크: ${shareUrl}`,
    "하객분들께는 위 공유 링크를 전달해 주세요.",
    "",
    `고객 수정 링크: ${editUrl}`,
    "추가 수정이 필요하실 때는 위 고객 수정 링크로 접속해 주세요.",
    "고객 수정 링크에는 수정 권한이 포함되어 있으니 하객에게는 공유하지 말아 주세요.",
  ].join("\n");
}

export function AdminPaymentUnlock() {
  const [customerEditLink, setCustomerEditLink] = useState("");
  const [adminPaymentKey, setAdminPaymentKey] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<InvitationSummary | null>(null);
  const [finalUrl, setFinalUrl] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");

  const parsedLink = useMemo(() => parseCustomerEditLink(customerEditLink), [customerEditLink]);
  const canCheck = Boolean(parsedLink.slug && parsedLink.editSecret && adminPaymentKey.trim());
  const canSubmit = Boolean(canCheck && summary);

  async function loadPreview() {
    if (!canCheck) {
      setMessage("고객 수정 링크와 관리자 비밀번호를 입력해 주세요.");
      return;
    }

    setIsPreviewing(true);
    setMessage("청첩장 정보를 확인하고 있어요.");
    setSummary(null);
    setFinalUrl("");
    setCustomerMessage("");

    try {
      const response = await fetch("/api/payments/admin-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: parsedLink.slug,
          editSecret: parsedLink.editSecret,
          adminPaymentKey,
        }),
      });

      const body = (await response.json().catch(() => null)) as AdminPreviewResponse | null;

      if (!response.ok || !body?.summary) {
        throw new Error(body?.message ?? "청첩장 정보를 확인하지 못했어요.");
      }

      setSummary(body.summary);
      setMessage("정보를 확인했어요. 아래 내용이 맞으면 워터마크 제거를 진행해 주세요.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "청첩장 정보 확인 중 문제가 생겼어요.");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function markAsPaid() {
    if (!canSubmit) {
      setMessage("먼저 청첩장 정보를 확인해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("결제 완료 처리 중이에요.");
    setFinalUrl("");
    setCustomerMessage("");

    try {
      const response = await fetch("/api/payments/admin-unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: parsedLink.slug,
          editSecret: parsedLink.editSecret,
          adminPaymentKey,
        }),
      });

      const body = (await response.json().catch(() => null)) as AdminUnlockResponse | null;

      if (!response.ok || !body?.row?.slug) {
        throw new Error(body?.message ?? "결제 완료 처리에 실패했어요.");
      }

      const nextFinalUrl = `${window.location.origin}/w/${body.row.slug}`;
      setFinalUrl(nextFinalUrl);
      setSummary((current) => (current ? { ...current, isPaid: true } : current));
      setCustomerMessage(makeCustomerMessage(nextFinalUrl, customerEditLink.trim()));
      setMessage(body.message ?? "결제 완료 처리됐어요.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "결제 완료 처리 중 문제가 생겼어요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#2f2924]">
      <section className="mx-auto grid max-w-[760px] gap-7">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#b29467]">Admin Payment</p>
          <h1 className="mt-3 text-3xl font-semibold">결제 확인 후 워터마크 제거</h1>
          <p className="mt-3 text-sm leading-6 text-[#6f6258]">
            고객 수정 링크를 붙여넣고 청첩장 정보를 먼저 확인한 뒤 워터마크를 제거하세요.
            처리 후 고객에게 보낼 안내문도 자동으로 만들어집니다.
          </p>
        </div>

        <div className="grid gap-5 rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(91,70,42,0.08)]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">고객 수정 링크</span>
            <textarea
              value={customerEditLink}
              onChange={(event) => {
                setCustomerEditLink(event.target.value);
                setSummary(null);
                setFinalUrl("");
                setCustomerMessage("");
              }}
              rows={4}
              placeholder="https://.../edit/wedding-20261024-xxxx?key=..."
              className="resize-none rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#b29467]"
            />
          </label>

          <div className="grid gap-2 rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-xs leading-5 text-[#806b4f]">
            <p>청첩장 주소: {parsedLink.slug || "아직 확인 전"}</p>
            <p>비밀코드: {parsedLink.editSecret ? "확인됨" : "아직 확인 전"}</p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">관리자 비밀번호</span>
            <input
              type="password"
              value={adminPaymentKey}
              onChange={(event) => {
                setAdminPaymentKey(event.target.value);
                setSummary(null);
                setFinalUrl("");
                setCustomerMessage("");
              }}
              placeholder="ADMIN_PAYMENT_KEY"
              className="rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b29467]"
            />
          </label>

          <button
            type="button"
            onClick={loadPreview}
            disabled={isPreviewing || !canCheck}
            className="rounded-full border border-[#2f2a25] bg-white px-5 py-4 text-sm font-semibold text-[#2f2a25] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPreviewing ? "확인 중" : "청첩장 정보 확인"}
          </button>

          {summary ? (
            <div className="grid gap-3 rounded-2xl border border-[#eadfcd] bg-white p-4 text-sm leading-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#332b24]">처리 전 확인</p>
                <span className="rounded-full bg-[#f6f0e8] px-3 py-1 text-xs font-semibold text-[#806b4f]">
                  {summary.isPaid ? "워터마크 제거됨" : "워터마크 표시 중"}
                </span>
              </div>
              <dl className="grid gap-2 text-[#6f6258]">
                <div className="grid grid-cols-[92px_1fr] gap-3">
                  <dt className="font-semibold text-[#332b24]">신랑 신부</dt>
                  <dd>
                    {summary.groomName} · {summary.brideName}
                  </dd>
                </div>
                <div className="grid grid-cols-[92px_1fr] gap-3">
                  <dt className="font-semibold text-[#332b24]">예식일</dt>
                  <dd>{summary.weddingDate}</dd>
                </div>
                <div className="grid grid-cols-[92px_1fr] gap-3">
                  <dt className="font-semibold text-[#332b24]">예식장</dt>
                  <dd>{summary.venueName}</dd>
                </div>
                <div className="grid grid-cols-[92px_1fr] gap-3">
                  <dt className="font-semibold text-[#332b24]">주소</dt>
                  <dd>{summary.venueAddress}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          <button
            type="button"
            onClick={markAsPaid}
            disabled={isSubmitting || !canSubmit}
            className="rounded-full bg-[#2f2a25] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "처리 중" : "워터마크 제거하고 최종 링크 만들기"}
          </button>

          {message ? (
            <div className="rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm leading-6 text-[#6f6258]">
              <p>{message}</p>
              {finalUrl ? (
                <div className="mt-3 grid gap-2">
                  <span className="text-xs font-semibold text-[#b29467]">청첩장 공유 링크</span>
                  <a
                    href={finalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-semibold text-[#2f2a25] underline underline-offset-4"
                  >
                    {finalUrl}
                  </a>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(finalUrl)}
                    className="justify-self-start rounded-full border border-[#d8c6ab] px-4 py-2 text-xs font-semibold text-[#806b4f]"
                  >
                    공유 링크 복사
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {customerMessage ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold">고객에게 보낼 안내문</span>
              <textarea
                readOnly
                value={customerMessage}
                rows={8}
                className="resize-none rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm leading-6 outline-none"
              />
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(customerMessage)}
                className="justify-self-start rounded-full border border-[#d8c6ab] px-4 py-2 text-xs font-semibold text-[#806b4f]"
              >
                안내문 복사
              </button>
            </label>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[#eadfcd] bg-white px-5 py-4 text-sm leading-7 text-[#6f6258]">
          <p className="font-semibold text-[#332b24]">운영 순서</p>
          <p>1. 고객이 제작본 저장 후 고객 수정 링크를 보냅니다.</p>
          <p>2. 스마트스토어에서 주문번호와 결제 상태를 확인합니다.</p>
          <p>3. 이 화면에 고객 수정 링크와 관리자 비밀번호를 입력합니다.</p>
          <p>4. 청첩장 정보 확인을 눌러 신랑/신부, 예식일, 예식장을 확인합니다.</p>
          <p>5. 내용이 맞으면 워터마크 제거를 누르고, 안내문을 고객에게 전달합니다.</p>
        </div>
      </section>
    </main>
  );
}
