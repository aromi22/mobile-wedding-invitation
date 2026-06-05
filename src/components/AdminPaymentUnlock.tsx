"use client";

import { useMemo, useState } from "react";

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

export function AdminPaymentUnlock() {
  const [customerEditLink, setCustomerEditLink] = useState("");
  const [adminPaymentKey, setAdminPaymentKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [finalUrl, setFinalUrl] = useState("");

  const parsedLink = useMemo(() => parseCustomerEditLink(customerEditLink), [customerEditLink]);
  const canSubmit = Boolean(parsedLink.slug && parsedLink.editSecret && adminPaymentKey.trim());

  async function markAsPaid() {
    if (!canSubmit) {
      setMessage("고객 수정 링크와 관리자 비밀번호를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("결제 완료 처리 중이에요.");
    setFinalUrl("");

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
      setMessage(body.message ?? "결제 완료 처리됐어요.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "결제 완료 처리 중 문제가 생겼어요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#2f2924]">
      <section className="mx-auto grid max-w-[720px] gap-7">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#b29467]">Admin Payment</p>
          <h1 className="mt-3 text-3xl font-semibold">결제 확인 후 워터마크 제거</h1>
          <p className="mt-3 text-sm leading-6 text-[#6f6258]">
            고객이 보내준 고객 수정 링크를 붙여넣고, 관리자 비밀번호를 입력하면
            청첩장 공유 링크에서 워터마크가 제거됩니다. 고객은 같은 수정 링크로 계속 수정할 수 있어요.
          </p>
        </div>

        <div className="grid gap-5 rounded-2xl border border-[#eadfcd] bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(91,70,42,0.08)]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">고객 수정 링크</span>
            <textarea
              value={customerEditLink}
              onChange={(event) => setCustomerEditLink(event.target.value)}
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
              onChange={(event) => setAdminPaymentKey(event.target.value)}
              placeholder="ADMIN_PAYMENT_KEY"
              className="rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b29467]"
            />
          </label>

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
        </div>

        <div className="rounded-2xl border border-[#eadfcd] bg-white px-5 py-4 text-sm leading-7 text-[#6f6258]">
          <p className="font-semibold text-[#332b24]">운영 순서</p>
          <p>1. 고객이 제작본 저장 후 고객 수정 링크를 보냅니다.</p>
          <p>2. 네가 스마트스토어에서 주문번호와 결제 상태를 확인합니다.</p>
          <p>3. 이 화면에 고객 수정 링크를 붙여넣고 워터마크 제거를 누릅니다.</p>
          <p>4. 생성된 청첩장 공유 링크를 고객에게 전달합니다.</p>
          <p>5. 고객은 고객 수정 링크로 계속 수정하고, 하객에게는 공유 링크만 전달합니다.</p>
        </div>
      </section>
    </main>
  );
}
