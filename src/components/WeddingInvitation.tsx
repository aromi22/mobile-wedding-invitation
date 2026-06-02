"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { WeddingAccount, WeddingData, WeddingPhoto } from "@/types/wedding";

type Person = WeddingData["couple"]["groom"];

const LETTERING_FONTS = {
  "segoe-print": '"Segoe Print", "Freestyle Script", "French Script MT", "Great Vibes", cursive',
  "freestyle-script": '"Freestyle Script", "French Script MT", "Great Vibes", cursive',
};

const CHILD_PHOTO_FRAME_CONFIG = {
  groom: {
    top: "10.8%",
    left: "18.5%",
    width: "20.9%",
    height: "24.2%",
  },
  bride: {
    top: "14.4%",
    left: "63.2%",
    width: "18.7%",
    height: "24.7%",
  },
} satisfies Record<string, CSSProperties>;

function photoAspectClass(ratio: WeddingPhoto["ratio"]) {
  if (ratio === "portrait") {
    return "aspect-[3/4]";
  }

  return "aspect-[4/3]";
}

function InvitationImage({
  photo,
  priority = false,
  className = "object-cover",
  sizes = "430px",
}: {
  photo: Pick<WeddingPhoto, "src" | "alt">;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const isPlainImage = /^(https?:|data:|blob:)/.test(photo.src);

  if (isPlainImage) {
    return <img src={photo.src} alt={photo.alt} className={`h-full w-full ${className}`} />;
  }

  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}

function useScrollReveal(refreshKey: string) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [refreshKey]);
}

function revealDelay(index: number, base = 90) {
  return { transitionDelay: `${index * base}ms` };
}

function coupleSeparator(data: WeddingData) {
  return data.familySettings.coupleNameSeparator === "heart" ? "♥" : "·";
}

function DeceasedMarker({ data }: { data: WeddingData }) {
  if (data.familySettings.deceasedMarker === "flower") {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
        <img
          src="/images/chrysanthemum-marker.svg"
          alt=""
          className="h-4 w-4 object-contain"
        />
      </span>
    );
  }

  if (data.familySettings.deceasedMarker === "lineart") {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
        <img
          src="/images/chrysanthemum-lineart-marker.svg"
          alt=""
          className="h-4 w-4 object-contain"
        />
      </span>
    );
  }

  return <span className="text-[#8a6b42]">故</span>;
}

function ParentName({
  name,
  isDeceased,
  data,
}: {
  name: string;
  isDeceased: boolean;
  data: WeddingData;
}) {
  if (!name) {
    return null;
  }

  if (!isDeceased) {
    return <span>{name}</span>;
  }

  if (data.familySettings.deceasedFormat === "suffix") {
    return (
      <span className="inline-flex items-center gap-1">
        <span>{name}</span>
        <DeceasedMarker data={data} />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <DeceasedMarker data={data} />
      <span>{name}</span>
    </span>
  );
}

function FamilyLine({ person, data }: { person: Person; data: WeddingData }) {
  const parents = [
    {
      name: person.parents.father,
      isDeceased: person.parents.fatherDeceased,
    },
    {
      name: person.parents.mother,
      isDeceased: person.parents.motherDeceased,
    },
  ].filter((parent) => parent.name);
  const givenName = person.givenName || person.name;

  if (!data.familySettings.showParents || parents.length === 0) {
    return (
      <>
        {person.parents.relation} {givenName}
      </>
    );
  }

  return (
    <>
      {parents.map((parent, index) => (
        <span key={`${parent.name}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? <span className="mx-1">·</span> : null}
          <ParentName name={parent.name} isDeceased={parent.isDeceased} data={data} />
        </span>
      ))}
      <span>의 {person.parents.relation} </span>
      <span>{givenName}</span>
    </>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[18rem] items-center gap-3 px-8 text-[#7f1d2d]">
      <span className="h-px flex-1 bg-[#7f1d2d]/18" />
      {label ? (
        <span className="font-display text-[0.68rem] uppercase tracking-[0.32em] text-[#7f1d2d]/70">
          {label}
        </span>
      ) : (
        <span className="h-1 w-1 rounded-full bg-[#7f1d2d]/45" />
      )}
      <span className="h-px flex-1 bg-[#7f1d2d]/18" />
    </div>
  );
}

function Section({
  label,
  title,
  children,
  className = "",
}: {
  label?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative px-7 py-16 text-center ${className}`}>
      {label ? (
        <p className="font-display reveal text-[0.68rem] uppercase tracking-[0.36em] text-[#7f1d2d]/65">
          {label}
        </p>
      ) : null}
      {title ? (
        <h2
          className="kitsch-title kitsch-scribble reveal mt-4 text-[2.45rem] leading-snug"
          style={revealDelay(1)}
        >
          {title}
        </h2>
      ) : null}
      <div className="reveal mx-auto mt-9 max-w-[22rem]" style={revealDelay(2)}>
        {children}
      </div>
    </section>
  );
}

function Cover({ data }: { data: WeddingData }) {
  const { groom, bride } = data.couple;
  const hero = data.hero;
  const openingVenue = data.event.venue;
  const letteringColor = ["#fff", "#ffffff", "white"].includes(
    hero.letteringColor.trim().toLowerCase(),
  )
    ? "#2f2924"
    : hero.letteringColor;
  const letteringStyle = {
    color: letteringColor,
    fontFamily: LETTERING_FONTS[hero.letteringFont],
    animationDuration: `${hero.letteringDuration}s`,
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffdf9] px-7 py-9 text-center">
      <div className="cover-reveal w-full max-w-[20rem]">
        <div className="bg-[#f9f6ef] px-3.5 pb-12 pt-3.5 shadow-[0_24px_54px_rgba(42,34,30,0.14)] ring-1 ring-[#2f2924]/5">
          <div className="relative mx-auto overflow-hidden bg-[#fffefe] px-4 pb-20 pt-4 shadow-[0_22px_38px_rgba(34,28,24,0.16),0_2px_8px_rgba(34,28,24,0.08)] ring-1 ring-black/[0.035]">
            <div className="relative aspect-[4/4.95] overflow-hidden bg-[#e8e1d8] shadow-[inset_0_0_0_1px_rgba(47,41,36,0.12),inset_0_3px_12px_rgba(47,41,36,0.2)]">
              <InvitationImage
                photo={data.photos.cover}
                priority
                className="object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-4 bottom-5 h-12 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.76)_52%,#fff_100%)]" />
          </div>

          <p
            key={`${hero.letteringText}-${hero.letteringFont}-${letteringColor}`}
            className="cover-script mx-auto mt-7 max-w-[15.5rem] whitespace-nowrap text-[clamp(1.05rem,3.9vw,1.28rem)] leading-none opacity-75"
            style={letteringStyle}
          >
            {hero.letteringText}
          </p>

          <div className="mt-6 text-[#2f2924]">
            <p className="font-display text-[0.58rem] tracking-[0.08em] text-[#2f2924]/48">
              The marriage of
            </p>
            <h1 className="mt-2 break-keep font-display text-[1.08rem] font-medium capitalize leading-tight tracking-[0.02em]">
              {groom.englishName} &amp; {bride.englishName}
            </h1>
            <p className="mt-3 break-keep text-[0.62rem] leading-5 tracking-[0.08em] text-[#2f2924]/64">
              {openingVenue}
            </p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-[#2f2924]/58">
              {data.event.calendarText.replaceAll(" ", " | ")}
            </p>
          </div>
        </div>

        {hero.showScrollHint ? (
          <div className="cover-reveal cover-reveal-delay-2 mx-auto mt-7 flex w-7 flex-col items-center gap-1.5 text-[#2f2924]/35">
            <span className="text-[0.56rem] tracking-[0.26em]">SCROLL</span>
            <span className="h-7 w-px bg-[#2f2924]/18" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ChildPhotoLayer({
  photo,
  style,
}: {
  photo?: WeddingPhoto;
  style: CSSProperties;
}) {
  return (
    <div
      className="absolute z-10 overflow-hidden bg-[#f6f2ec]"
      style={style}
      aria-hidden={!photo?.src}
    >
      {photo?.src ? (
        <div
          className="relative h-full w-full"
          style={{
            transform: `scale(${photo.scale ?? 1})`,
            transformOrigin: "center",
          }}
        >
          <InvitationImage
            photo={photo}
            sizes="160px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.96),rgba(238,231,222,0.72))] text-[0.52rem] uppercase tracking-[0.16em] text-[#9a8c7d]">
          Photo
        </div>
      )}
    </div>
  );
}

function ChildhoodFrameSection({ data }: { data: WeddingData }) {
  const illustration = data.photos.childhoodIllustration ?? {
    src: "/images/childhood-frame-illustration.png",
    alt: "신랑 신부 어릴 적 사진을 넣는 액자 일러스트",
    ratio: "portrait" as const,
  };

  return (
    <section className="relative bg-[#fffdf9] px-5 pb-14 pt-4 text-center">
      <div className="reveal mx-auto max-w-[24rem]">
        <div className="relative mx-auto aspect-[1123/1429] w-full overflow-hidden bg-[#fffdf9]">
          <ChildPhotoLayer
            photo={data.photos.groomChildPhoto}
            style={CHILD_PHOTO_FRAME_CONFIG.groom}
          />
          <ChildPhotoLayer
            photo={data.photos.brideChildPhoto}
            style={CHILD_PHOTO_FRAME_CONFIG.bride}
          />
          <div className="pointer-events-none absolute inset-0 z-20">
            <InvitationImage
              photo={illustration}
              sizes="430px"
              className="object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function InvitationMessage({ data }: { data: WeddingData }) {
  return (
    <Section label="Invitation" title="소중한 분들을 초대합니다">
      <div className="mx-auto mb-9 h-9 w-px bg-[#7f1d2d]/18" />
      <p className="mx-auto max-w-[17rem] whitespace-pre-line break-keep text-center text-[1.02rem] leading-9 text-[#403a34]">
        {data.message.opening}
      </p>
      <div className="mx-auto my-11 max-w-[19rem]">
        <div
          className={`photo-sticker relative mx-auto max-w-[17rem] overflow-hidden ${photoAspectClass(
            data.photos.intro.ratio,
          )}`}
        >
          <InvitationImage photo={data.photos.intro} sizes="360px" />
        </div>
      </div>
      <p className="mx-auto mt-7 max-w-[18rem] whitespace-pre-line break-keep text-center text-[0.95rem] leading-8 text-[#746a61]">
        {data.message.body}
      </p>
    </Section>
  );
}

function StorySection({ data }: { data: WeddingData }) {
  return (
    <section className="kitsch-red-band relative px-7 py-16 text-center">
      <span className="kitsch-heart left-8 top-10 scale-75 brightness-0 invert" />
      <span className="kitsch-heart fill bottom-10 right-8 scale-90 brightness-0 invert" />
      <p className="font-display text-[0.68rem] uppercase tracking-[0.36em] text-[#7f1d2d]/65">
        Our Story
      </p>
      <h2 className="kitsch-title kitsch-scribble mt-4 text-[2.45rem] leading-snug">
        우리들의 이야기
      </h2>
      <div className="mx-auto mt-10 max-w-[22rem] space-y-14">
        {data.stories.map((story, index) => (
          <article key={story.title} className="reveal text-center" style={revealDelay(index)}>
            <div
              className={`photo-sticker relative overflow-hidden ${index % 2 === 0 ? "-rotate-2" : "rotate-2"} ${photoAspectClass(
                story.ratio ?? "portrait",
              )} ${
                index % 2 === 0 ? "rounded-t-[7rem]" : "rounded-b-[7rem]"
              }`}
            >
              <InvitationImage
                photo={{ src: story.image, alt: story.title }}
                sizes="430px"
              />
            </div>
            <p className="mt-7 text-[0.68rem] uppercase tracking-[0.3em] text-[#7f1d2d]/55">
              Story {index + 1}
            </p>
            <h3 className="mt-3 text-xl font-medium text-[#342526]">
              {story.title}
            </h3>
            <p className="mx-auto mt-5 max-w-[18rem] whitespace-pre-line break-keep text-center text-sm leading-7 text-[#746a61]">
              {story.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function QASection({ data }: { data: WeddingData }) {
  if (data.storyStyle.type !== "qa" || !data.storyStyle.qaEnabled || data.qa.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#fbfaf7] px-7 py-16 text-center">
      <p className="font-display reveal text-[0.68rem] uppercase tracking-[0.36em] text-[#b29467]">
        Q & A
      </p>
      <h2 className="reveal mt-3 text-[1.48rem] font-medium text-[#2f2a25]" style={revealDelay(1)}>
        우리에게 묻고 답하다
      </h2>
      <div className="mx-auto mt-10 max-w-[22rem] space-y-4 text-left">
        {data.qa.map((item, index) => (
          <article
            key={item.id}
            className="reveal rounded-lg border border-[#eee3d4] bg-white/78 px-5 py-5 shadow-[0_14px_34px_rgba(80,62,38,0.07)]"
            style={revealDelay(index, 95)}
          >
            <p className="font-display text-xs uppercase tracking-[0.24em] text-[#b29467]">
              Question {index + 1}
            </p>
            <h3 className="mt-3 break-keep text-lg font-medium leading-8 text-[#2f2a25]">
              {item.question}
            </h3>
            <p className="mt-4 break-keep text-sm leading-7 text-[#746a61]">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelineSection({ data }: { data: WeddingData }) {
  if (
    data.storyStyle.type !== "timeline" ||
    !data.storyStyle.timelineEnabled ||
    data.timeline.length === 0
  ) {
    return null;
  }

  return (
    <section className="bg-[#fffdf8] px-7 py-16 text-center">
      <p className="font-display reveal text-[0.68rem] uppercase tracking-[0.36em] text-[#b29467]">
        Our Timeline
      </p>
      <h2 className="reveal mt-3 text-[1.48rem] font-medium text-[#2f2a25]" style={revealDelay(1)}>
        만남부터 오늘까지
      </h2>
      <div className="relative mx-auto mt-12 max-w-[22rem] text-left">
        <span className="absolute left-[0.42rem] top-2 h-[calc(100%-1rem)] w-px bg-[#dfcfb8]" />
        <div className="space-y-7">
          {data.timeline.map((item, index) => (
            <article
              key={item.id}
              className="reveal relative pl-8"
              style={revealDelay(index, 100)}
            >
              <span className="absolute left-0 top-2 h-3 w-3 rounded-full border border-[#b29467] bg-[#fffdf8] shadow-[0_0_0_5px_rgba(178,148,103,0.1)]" />
              <div className="rounded-lg border border-[#eee3d4] bg-white px-5 py-5 shadow-[0_14px_34px_rgba(80,62,38,0.06)]">
                <p className="text-xs tracking-[0.18em] text-[#b29467]">{item.date}</p>
                <h3 className="mt-2 text-lg font-medium text-[#2f2a25]">{item.title}</h3>
                <p className="mt-3 break-keep text-sm leading-7 text-[#746a61]">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonLine({ person, data }: { person: Person; data: WeddingData }) {
  return (
    <div
      className={`grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 border-b border-[#eee7de] py-4 last:border-b-0 ${
        data.familySettings.align === "left" ? "text-left" : "text-center"
      }`}
    >
      <span className="text-sm text-[#b29467]">{person.role}</span>
      <div>
        <p className="text-[1.35rem] font-medium text-[#332b24]">
          {person.name}
        </p>
        <p className="mt-1 break-keep text-xs leading-5 text-[#7c6e62]">
          <FamilyLine person={person} data={data} />
        </p>
        <p className="hidden">
          {person.parents.father} · {person.parents.mother}의{" "}
          {person.parents.relation}
        </p>
      </div>
      <a
        href={`tel:${person.phone}`}
        className="rounded-full border border-[#dfd2bf] px-3 py-2 text-xs font-medium text-[#867052]"
      >
        전화
      </a>
    </div>
  );
}

function FamilySection({ data }: { data: WeddingData }) {
  return (
    <Section label="Bride & Groom" title="신랑 신부 및 혼주">
      <div className="border-y border-[#eee7de] px-2 py-2">
        <div className="reveal">
          <PersonLine person={data.couple.groom} data={data} />
        </div>
        <div className="reveal" style={revealDelay(1)}>
          <PersonLine person={data.couple.bride} data={data} />
        </div>
      </div>
    </Section>
  );
}

function CalendarSection({ data }: { data: WeddingData }) {
  const days = useMemo(() => {
    const firstDay = new Date(data.event.year, data.event.month - 1, 1).getDay();
    const lastDate = new Date(data.event.year, data.event.month, 0).getDate();
    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: lastDate }, (_, index) => index + 1),
    ];
  }, [data.event.day, data.event.month, data.event.year]);

  return (
    <Section label="Wedding Day" title={data.event.dateText}>
      <div className="mx-auto max-w-[19rem]">
        <div className="reveal mb-5 flex items-end justify-center gap-3">
          <span className="font-display text-5xl font-light italic text-[#7f1d2d]">
            {String(data.event.month).padStart(2, "0")}
          </span>
          <span className="pb-1 text-sm tracking-[0.2em] text-[#7c4b45]">
            {data.event.year}
          </span>
        </div>
        <div className="reveal grid grid-cols-7 gap-y-3 border-y border-[#7f1d2d]/18 py-4 text-xs text-[#7c4b45]" style={revealDelay(1)}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
          {days.map((day, index) => (
            <span
              key={`${day ?? "empty"}-${index}`}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                day === data.event.day
                  ? "bg-[#7f1d2d] text-white shadow-[0_8px_18px_rgba(127,29,45,0.18)]"
                  : "text-[#5f5349]"
              }`}
            >
              {day}
            </span>
          ))}
        </div>
        <p className="reveal mt-8 text-sm tracking-[0.18em] text-[#7c6e62]" style={revealDelay(2)}>
          {data.event.weekday} {data.event.time}
        </p>
      </div>
    </Section>
  );
}

function LocationSection({ data }: { data: WeddingData }) {
  return (
    <Section label="Location" title="예식 장소 안내" className="pt-10">
      <div className="space-y-5">
        <div
          className={`photo-sticker reveal relative overflow-hidden ${photoAspectClass(
            data.photos.venue.ratio,
          )}`}
        >
          <InvitationImage photo={data.photos.venue} sizes="360px" />
        </div>
        <div className="reveal" style={revealDelay(1)}>
          <p className="text-xl font-medium text-[#332b24]">{data.event.venue}</p>
          <p className="mt-3 text-sm leading-7 text-[#76695e]">
            {data.event.address}
          </p>
        </div>
        <a
          href={data.event.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="reveal inline-flex w-full items-center justify-center border border-[#7f1d2d]/20 bg-white/55 px-6 py-4 text-sm font-medium tracking-[0.18em] text-[#7f1d2d] shadow-[0_14px_32px_rgba(64,42,34,0.06)]"
          style={revealDelay(2)}
        >
          지도 보기
        </a>
      </div>
    </Section>
  );
}

function GallerySection({ data }: { data: WeddingData }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <Section label="Gallery" title="우리의 순간">
      <div className="grid grid-cols-2 gap-3">
        {data.photos.gallery.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setSelectedImage(photo.src)}
            className={`photo-sticker reveal relative overflow-hidden transition duration-300 hover:rotate-0 active:scale-[1.02] ${
              index === 0
                ? "col-span-2 aspect-[3/4.2] -rotate-1"
                : photoAspectClass(photo.ratio)
            }`}
            style={revealDelay(index, 85)}
            aria-label={`갤러리 사진 ${index + 1} 크게 보기`}
          >
            <span className="relative block h-full w-full overflow-hidden">
              <InvitationImage
                photo={photo}
                sizes="430px"
                className={`transition duration-500 hover:scale-[1.025] active:scale-105 ${
                  photo.ratio === "landscape" ? "object-contain" : "object-cover"
                }`}
              />
            </span>
          </button>
        ))}
      </div>

      {selectedImage ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#241f1a]/88 p-5"
          onClick={() => setSelectedImage(null)}
          aria-label="갤러리 크게 보기 닫기"
        >
          <span className="absolute right-5 top-5 text-sm tracking-[0.2em] text-white/80">
            CLOSE
          </span>
          <span className="relative block aspect-[4/5] w-full max-w-[25rem] overflow-hidden rounded-sm bg-[#eee7de]">
            <InvitationImage
              photo={{ src: selectedImage, alt: "확대된 갤러리 사진" }}
              sizes="430px"
              className="object-contain"
            />
          </span>
        </button>
      ) : null}
    </Section>
  );
}

function AccountRow({ account }: { account: WeddingAccount }) {
  async function copyAccount() {
    await navigator.clipboard.writeText(
      `${account.bank} ${account.number} ${account.holder}`,
    );
    alert("계좌번호가 복사되었습니다.");
  }

  return (
    <div className="reveal border-b border-[#eee7de] py-5 text-left last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#7f1d2d]/70">{account.label}</p>
          <p className="mt-2 text-base font-medium text-[#332b24]">
            {account.bank} {account.number}
          </p>
          <p className="mt-1 text-sm text-[#7c6e62]">
            예금주 {account.holder}
          </p>
        </div>
        <button
          type="button"
          onClick={copyAccount}
          className="shrink-0 rounded-full border border-[#7f1d2d]/20 px-3 py-2 text-xs font-medium text-[#7f1d2d]"
        >
          복사
        </button>
      </div>
    </div>
  );
}

function AccountSection({ data }: { data: WeddingData }) {
  const accounts =
    data.accounts.length > 0
      ? data.accounts
      : [
          {
            id: "groom-fallback",
            side: "groom" as const,
            label: `${data.couple.groom.role} 측`,
            ...data.couple.groom.account,
          },
          {
            id: "bride-fallback",
            side: "bride" as const,
            label: `${data.couple.bride.role} 측`,
            ...data.couple.bride.account,
          },
        ];

  return (
    <Section label="Gift" title="마음 전하실 곳">
      <div className="border-y border-[#eee7de] px-4 py-1">
        {accounts.map((account) => (
          <AccountRow key={account.id} account={account} />
        ))}
      </div>
    </Section>
  );
}

function ActionSection({ data }: { data: WeddingData }) {
  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    alert("청첩장 링크가 복사되었습니다.");
  }

  return (
    <section className="px-7 pb-16 pt-6 text-center">
      <div className="mx-auto max-w-[22rem] space-y-3">
        <a
          href={data.rsvp.url}
          target="_blank"
          rel="noreferrer"
          className="reveal flex w-full items-center justify-center rounded-full bg-[#342526] px-6 py-4 text-sm font-medium tracking-[0.12em] text-white shadow-[0_18px_38px_rgba(52,37,38,0.18)]"
        >
          {data.rsvp.label}
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="reveal w-full rounded-full border border-[#7f1d2d]/18 bg-white/55 px-6 py-4 text-sm font-medium tracking-[0.12em] text-[#7f1d2d]"
          style={revealDelay(1)}
        >
          링크 복사하기
        </button>
      </div>
    </section>
  );
}

function Footer({ data }: { data: WeddingData }) {
  return (
    <footer className="px-8 pb-14 text-center">
      <Divider />
      <p className="mx-auto mt-8 max-w-[18rem] break-keep text-sm leading-7 text-[#76695e]">
        {data.message.footer}
      </p>
      <p className="mt-8 font-['Great_Vibes'] text-4xl font-light text-[#7f1d2d]/75">Thank you</p>
    </footer>
  );
}

function MusicButton({ music }: { music: WeddingData["music"] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!music?.src) {
    return null;
  }

  async function toggleMusic() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    await audio.play();
    setIsPlaying(true);
  }

  return (
    <>
      <audio ref={audioRef} src={music.src} loop preload="none" />
      <button
        type="button"
        onClick={toggleMusic}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-[#2f2a25]/80 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur"
        aria-label={isPlaying ? "배경음악 정지" : "배경음악 재생"}
        title={music.title}
      >
        {isPlaying ? "Ⅱ" : "♪"}
      </button>
    </>
  );
}

export function WeddingInvitation({ data }: { data: WeddingData }) {
  const revealKey = `${data.storyStyle.type}-${data.storyStyle.qaEnabled}-${data.storyStyle.timelineEnabled}-${data.qa.length}-${data.timeline.length}`;

  useScrollReveal(revealKey);

  return (
    <main className="kitsch-paper relative mx-auto min-h-screen max-w-[430px] overflow-hidden text-[#4a2224] shadow-[0_0_80px_rgba(91,70,42,0.12)]">
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <span className="ambient-petal ambient-petal-1" />
        <span className="ambient-petal ambient-petal-2" />
        <span className="ambient-glow ambient-glow-1" />
      </div>
      <Cover data={data} />
      <ChildhoodFrameSection data={data} />
      <InvitationMessage data={data} />
      {data.storyStyle.type === "default" ? <StorySection data={data} /> : null}
      <QASection data={data} />
      <TimelineSection data={data} />
      <Divider label="Together" />
      <FamilySection data={data} />
      <CalendarSection data={data} />
      <Divider />
      <LocationSection data={data} />
      <GallerySection data={data} />
      <AccountSection data={data} />
      <ActionSection data={data} />
      <Footer data={data} />
      <MusicButton music={data.music} />
    </main>
  );
}
