"use client";

import { useMemo, useState } from "react";
import { wedding } from "@/data/wedding";
import { WeddingInvitation } from "@/components/WeddingInvitation";
import type { WeddingData } from "@/types/wedding";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-[#5f5349]">
      <span>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
      />
    </label>
  );
}

export function DemoInvitationEditor() {
  const [groomName, setGroomName] = useState(wedding.couple.groom.name);
  const [brideName, setBrideName] = useState(wedding.couple.bride.name);
  const [date, setDate] = useState("2026-10-24");
  const [time, setTime] = useState(wedding.event.time);
  const [venue, setVenue] = useState(wedding.event.venue);
  const [cover, setCover] = useState(wedding.photos.cover.src);
  const [message, setMessage] = useState(wedding.message.body);

  const preview = useMemo<WeddingData>(() => {
    const next = structuredClone(wedding);
    const [year, month, day] = date.split("-").map(Number);

    next.couple.groom.name = groomName || wedding.couple.groom.name;
    next.couple.bride.name = brideName || wedding.couple.bride.name;
    next.event.year = year || wedding.event.year;
    next.event.month = month || wedding.event.month;
    next.event.day = day || wedding.event.day;
    next.event.dateText = `${next.event.year}.${String(next.event.month).padStart(2, "0")}.${String(
      next.event.day,
    ).padStart(2, "0")}`;
    next.event.time = time;
    next.event.venue = venue;
    next.photos.cover.src = cover || wedding.photos.cover.src;
    next.message.body = message;

    return next;
  }, [brideName, cover, date, groomName, message, time, venue]);

  return (
    <main className="min-h-screen bg-[#f6f0e8]">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_470px] lg:items-start">
        <section className="rounded-lg bg-[#fffdf8] px-5 shadow-[0_18px_50px_rgba(91,70,42,0.12)]">
          <header className="sticky top-0 z-10 -mx-5 border-b border-[#eadfcd] bg-[#fffdf8]/95 px-5 py-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-[#b29467]">
              Demo Editor
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-[#332b24]">
              구매 전 편집 체험
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#7c6e62]">
              실제 저장은 되지 않는 체험 화면입니다. 구매 후에는 고객 전용 편집
              링크에서 최종 청첩장을 저장할 수 있어요.
            </p>
          </header>

          <div className="grid gap-5 py-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="신랑 이름" value={groomName} onChange={setGroomName} />
              <Field label="신부 이름" value={brideName} onChange={setBrideName} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="예식 날짜" value={date} onChange={setDate} placeholder="2026-10-24" />
              <Field label="예식 시간" value={time} onChange={setTime} />
            </div>
            <Field label="예식 장소" value={venue} onChange={setVenue} />
            <Field
              label="커버 이미지 URL"
              value={cover}
              onChange={setCover}
              placeholder="/images/do (1).jpg"
            />
            <label className="grid gap-2 text-sm text-[#5f5349]">
              <span>초대 문구</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="resize-none rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base leading-7 text-[#332b24] outline-none transition focus:border-[#b29467]"
              />
            </label>

            <div className="rounded-xl border border-[#eadfcd] bg-white p-5">
              <p className="text-sm font-semibold text-[#332b24]">구매 후 제공되는 것</p>
              <p className="mt-2 text-sm leading-6 text-[#7c6e62]">
                구매 고객에게는 비밀코드가 포함된 고객 전용 편집 링크와 최종 보기
                링크가 개별로 제공됩니다.
              </p>
              <p className="mt-4 rounded-lg bg-[#f8f4ee] px-4 py-3 text-sm leading-6 text-[#5f5349]">
                이 화면은 구매 전 체험용이라 저장과 링크 발급은 되지 않습니다.
                구매 후 안내받은 전용 링크에서 실제 청첩장을 수정할 수 있어요.
              </p>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-6">
          <div className="mb-3 px-1 text-sm text-[#7c6e62]">
            오른쪽은 고객이 보는 모바일 청첩장 미리보기입니다.
          </div>
          <div className="overflow-hidden rounded-[1.6rem] bg-[#eee5da] p-3 shadow-[0_20px_60px_rgba(91,70,42,0.18)]">
            <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[1.15rem] bg-white">
              <WeddingInvitation data={preview} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
