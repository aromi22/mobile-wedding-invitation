"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type {
  WeddingAccount,
  WeddingData,
  WeddingPhoto,
  WeddingRsvpFieldKey,
  WeddingRsvpResponse,
} from "@/types/wedding";

type Person = WeddingData["couple"]["groom"];

const LETTERING_FONTS = {
  "segoe-print": '"Segoe Print", "Freestyle Script", "French Script MT", "Great Vibes", cursive',
  "freestyle-script": '"Freestyle Script", "French Script MT", "Great Vibes", cursive',
};

const CHILD_PHOTO_FRAME_CONFIG = {
  groom: {
    top: "10.85%",
    left: "18.55%",
    width: "23.85%",
    height: "25.75%",
  },
  bride: {
    top: "16.1%",
    left: "63.0%",
    width: "23.05%",
    height: "26.75%",
  },
} satisfies Record<string, CSSProperties>;

const DEFAULT_RSVP_FIELDS: Record<WeddingRsvpFieldKey, boolean> = {
  category: true,
  attendance: true,
  meal: true,
  shuttle: false,
  name: true,
  phone: false,
  companionName: true,
  companionPhone: false,
  privacy: false,
  allEvents: true,
};

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
    <div className="mx-auto flex w-full max-w-[18rem] items-center gap-3 px-8 text-[#2f2924]">
      <span className="h-px flex-1 bg-[#2f2924]/18" />
      {label ? (
        <span className="font-display text-[0.68rem] uppercase tracking-[0.32em] text-[#2f2924]/70">
          {label}
        </span>
      ) : (
        <span className="h-1 w-1 rounded-full bg-[#2f2924]/45" />
      )}
      <span className="h-px flex-1 bg-[#2f2924]/18" />
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
        <p className="font-display reveal text-[0.68rem] uppercase tracking-[0.36em] text-[#2f2924]/65">
          {label}
        </p>
      ) : null}
      {title ? (
        <h2
          className="kitsch-title kitsch-scribble reveal mt-4 whitespace-nowrap text-[clamp(1.8rem,7vw,2.28rem)] leading-snug"
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
  const letteringText = hero.letteringText.replace(/\s+/g, " ").trim() || "Our Wedding Day";
  const letteringColor = ["#fff", "#ffffff", "white"].includes(
    hero.letteringColor.trim().toLowerCase(),
  )
    ? "#2f2924"
    : hero.letteringColor;
  const letteringStyle = {
    color: letteringColor,
    fontFamily: LETTERING_FONTS[hero.letteringFont],
    fontSize: "clamp(0.92rem, 4vw, 1.18rem)",
    lineHeight: 1,
    maxWidth: "13.5rem",
    overflowWrap: "normal",
    textWrap: "nowrap",
    whiteSpace: "nowrap",
    animationDuration: `${hero.letteringDuration}s`,
  } satisfies CSSProperties;

  if (hero.coverTemplate === "fullscreen") {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[#1f1b18]">
        <div className="absolute inset-0 scale-[0.94]">
          <InvitationImage
            photo={data.photos.cover}
            priority
            className="object-cover"
            sizes="430px"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.02)_45%,rgba(0,0,0,0.22)_100%)]" />
        {hero.showScrollHint ? (
          <div className="cover-reveal cover-reveal-delay-2 absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-white/70">
            <span className="text-[0.56rem] tracking-[0.26em]">SCROLL</span>
            <span className="h-7 w-px bg-white/40" />
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-7 py-9 text-center">
      <div className="cover-reveal w-full max-w-[20rem]">
        <div className="bg-white px-3.5 pb-12 pt-3.5 shadow-[0_24px_54px_rgba(42,34,30,0.1)] ring-1 ring-[#2f2924]/5">
          <div className="relative mx-auto overflow-hidden bg-[#fffefe] px-4 pb-20 pt-4 shadow-[0_22px_38px_rgba(34,28,24,0.16),0_2px_8px_rgba(34,28,24,0.08)] ring-1 ring-black/[0.035]">
            <div className="relative aspect-[4/4.95] overflow-hidden bg-[#e8e1d8] shadow-[inset_0_0_0_1px_rgba(47,41,36,0.12),inset_0_3px_12px_rgba(47,41,36,0.2)]">
              <InvitationImage
                photo={data.photos.cover}
                priority
                className="object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-4 bottom-5 h-12 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.76)_52%,#fff_100%)]" />
            <p
              key={`${letteringText}-${hero.letteringFont}-${letteringColor}`}
              className="cover-script absolute inset-x-4 bottom-8 mx-auto block w-full opacity-75"
              style={letteringStyle}
            >
              {letteringText}
            </p>
          </div>

          {hero.showEventInfo ? (
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
          ) : null}
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
  const scale = photo?.scale ?? 1;

  return (
    <div
      className="absolute z-10 overflow-hidden bg-white"
      style={style}
      aria-hidden={!photo?.src}
    >
      {photo?.src ? (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center",
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white text-[0.52rem] uppercase tracking-[0.16em] text-[#9a8c7d]">
          Photo
        </div>
      )}
    </div>
  );
}

function CoupleProfileCard({ person }: { person: Person }) {
  const profile = person.profile;
  const tags = profile.tags.map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean);

  return (
    <div className="break-keep text-center text-[#161616]">
      <p className="text-[0.98rem] font-semibold leading-7">
        <span className="mr-1 text-[0.86rem] font-medium text-[#9f1f2d]">{person.role}</span>
        {person.name}
      </p>
      <p className="mt-1 text-[0.92rem] leading-7">
        {[profile.birthYear, profile.hometown].filter(Boolean).join(", ")}
      </p>
      <p className="text-[0.92rem] leading-7">{profile.intro}</p>
      <p className="text-[0.92rem] leading-7">
        {profile.relationship}
        {profile.relationship ? <span className="ml-1 text-[#b5121b]">♥</span> : null}
      </p>
      {tags.length ? (
        <p className="mt-1 text-[0.9rem] leading-7">
          {tags.map((tag) => `#${tag}`).join(" ")}
        </p>
      ) : null}
    </div>
  );
}

function ChildhoodFrameSection({ data }: { data: WeddingData }) {
  const illustration = {
    ...(data.photos.childhoodIllustration ?? {
    src: "/images/childhood-frame-illustration-overlay.png",
    alt: "?좊옉 ?좊? ?대┫ ???ъ쭊???ｋ뒗 ?≪옄 ?쇰윭?ㅽ듃",
    ratio: "portrait" as const,
    }),
    src: "/images/childhood-frame-illustration-overlay.png",
    alt: "Childhood frame illustration",
  };

  return (
    <section className="relative px-5 pb-14 pt-4 text-center">
      <div className="reveal mx-auto max-w-[24rem]">
        <div className="relative mx-auto aspect-[1123/1429] w-full overflow-hidden bg-transparent">
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
              className="object-contain"
            />
          </div>
        </div>
        {data.sections.profile ? (
          <div className="reveal mx-auto mt-6 grid max-w-[22rem] grid-cols-2 gap-5 px-1">
            <CoupleProfileCard person={data.couple.groom} />
            <CoupleProfileCard person={data.couple.bride} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InvitationMessage({ data }: { data: WeddingData }) {
  return (
    <Section label="Invitation" title="소중한 분들을 초대합니다">
      <div className="mx-auto mb-9 h-9 w-px bg-[#2f2924]/18" />
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
      <p className="font-display text-[0.68rem] uppercase tracking-[0.36em] text-[#2f2924]/65">
        Our Story
      </p>
      <h2 className="kitsch-title kitsch-scribble mt-4 text-[2.45rem] leading-snug">
        우리들의 이야기
      </h2>
      <div className="mx-auto mt-10 max-w-[23rem] space-y-5">
        {data.stories.map((story, index) => (
          <article
            key={story.title}
            className="reveal grid grid-cols-[45%_1fr] overflow-hidden bg-white/86 text-left shadow-[0_10px_26px_rgba(64,42,34,0.08)]"
            style={revealDelay(index)}
          >
            <div className="relative min-h-[9.2rem] overflow-hidden bg-[#eee7de]">
              <InvitationImage
                photo={{ src: story.image, alt: story.title }}
                sizes="190px"
                className="object-cover"
              />
            </div>
            <div className="flex min-h-[9.2rem] flex-col justify-center px-4 py-4">
              <p className="font-display text-[1.15rem] font-semibold leading-none text-[#2f2924]/72">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 break-keep text-[0.98rem] font-semibold leading-5 text-[#342526]">
                {story.title}
              </h3>
              <p className="mt-2 whitespace-pre-line break-keep text-[0.72rem] leading-5 text-[#746a61]">
                {story.body}
              </p>
            </div>
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
    <section className="bg-white px-7 py-16 text-center">
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
    <section className="bg-white px-7 py-16 text-center">
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
          {person.parents.father} · {person.parents.mother}{" "}
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
    <Section label="Bride & Groom" title="신랑 신부 소개">
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
  const weekdayShort = useMemo(() => {
    const date = new Date(data.event.year, data.event.month - 1, data.event.day);
    return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  }, [data.event.day, data.event.month, data.event.year]);
  const timeShort = useMemo(() => {
    const match = data.event.time.match(/(\d{1,2})(?::(\d{2}))?/);
    const hour24 = match ? Number(match[1]) : 13;
    const minute = match?.[2] ?? "";
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;

    return minute && minute !== "00" ? `${hour12}:${minute} ${period}` : `${hour12} ${period}`;
  }, [data.event.time]);
  const weddingDateLine = `${data.event.year}.${String(data.event.month).padStart(2, "0")}.${String(
    data.event.day,
  ).padStart(2, "0")} | ${weekdayShort} | ${timeShort}`;
  const dDayText = useMemo(() => {
    const weddingDate = new Date(data.event.year, data.event.month - 1, data.event.day);
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = Math.ceil((weddingDate.getTime() - todayOnly.getTime()) / 86400000);

    if (diff === 0) {
      return "D-Day";
    }

    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  }, [data.event.day, data.event.month, data.event.year]);

  const days = useMemo(() => {
    const firstDay = new Date(data.event.year, data.event.month - 1, 1).getDay();
    const lastDate = new Date(data.event.year, data.event.month, 0).getDate();
    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: lastDate }, (_, index) => index + 1),
    ];
  }, [data.event.day, data.event.month, data.event.year]);

  return (
    <Section label="Wedding Day">
      <div className="mx-auto max-w-[19rem]">
        <div className="reveal mb-8 text-center" style={revealDelay(1)}>
          <p className="break-keep text-[1.18rem] font-light leading-8 tracking-[0.02em] text-[#2f2924]">
            {weddingDateLine}
          </p>
          <div className="mx-auto mt-4 h-px w-28 bg-[#2f2924]/18" />
          <p className="mt-4 font-display text-[1.02rem] uppercase tracking-[0.28em] text-[#2f2924]/72">
            {dDayText}
          </p>
        </div>
        <div className="reveal mb-5 flex items-end justify-center gap-3">
          <span className="font-display text-5xl font-light italic text-[#2f2924]">
            {String(data.event.month).padStart(2, "0")}
          </span>
          <span className="pb-1 text-sm tracking-[0.2em] text-[#7c4b45]">
            {data.event.year}
          </span>
        </div>
        <div className="reveal grid grid-cols-7 gap-y-3 border-y border-[#2f2924]/18 py-4 text-xs text-[#7c4b45]" style={revealDelay(1)}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
          {days.map((day, index) => (
            <span
              key={`${day ?? "empty"}-${index}`}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                day === data.event.day
                  ? "bg-[#2f2924] text-white shadow-[0_8px_18px_rgba(47,41,36,0.14)]"
                  : "text-[#5f5349]"
              }`}
            >
              {day}
            </span>
          ))}
        </div>
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
          className="reveal inline-flex w-full items-center justify-center border border-[#2f2924]/20 bg-white/55 px-6 py-4 text-sm font-medium tracking-[0.18em] text-[#2f2924] shadow-[0_14px_32px_rgba(64,42,34,0.06)]"
          style={revealDelay(2)}
        >
          지도 보기
        </a>
      </div>
    </Section>
  );
}

function GallerySection({ data }: { data: WeddingData }) {
  const gallery = data.photos.gallery.slice(0, 50);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto = selectedIndex === null ? null : gallery[selectedIndex];
  const selectedDisplayIndex = selectedIndex === null ? 0 : selectedIndex + 1;
  const showPrevious = () => {
    setSelectedIndex((current) =>
      current === null ? current : (current - 1 + gallery.length) % gallery.length,
    );
  };
  const showNext = () => {
    setSelectedIndex((current) =>
      current === null ? current : (current + 1) % gallery.length,
    );
  };

  return (
    <Section label="Gallery" title="우리의 순간">
      <div className="grid grid-cols-3 gap-1.5">
        {gallery.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="reveal is-visible relative aspect-square overflow-hidden bg-[#eee7de] transition duration-300 active:scale-[0.98]"
            style={revealDelay(index, 35)}
            aria-label={`갤러리 사진 ${index + 1} 보기`}
          >
            <span className="relative block h-full w-full overflow-hidden">
              <InvitationImage
                photo={photo}
                sizes="140px"
                className="object-cover"
              />
            </span>
          </button>
        ))}
      </div>

      {selectedPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241f1a]/88 p-5">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedIndex(null)}
            aria-label="갤러리 닫기"
          />
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-2xl text-white backdrop-blur"
            aria-label="이전 사진"
          >
            ‹
          </button>
          <span className="relative z-10 block max-h-[78vh] w-full max-w-[25rem]">
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-lg leading-none text-white shadow-[0_6px_16px_rgba(0,0,0,0.2)] backdrop-blur"
              aria-label="닫기"
            >
              ×
            </button>
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              className="mx-auto block max-h-[78vh] max-w-full object-contain"
              draggable={false}
            />
          </span>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-2xl text-white backdrop-blur"
            aria-label="다음 사진"
          >
            ›
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-white/75">
            {selectedDisplayIndex} / {gallery.length}
          </p>
        </div>
      ) : null}
    </Section>
  );
}

function AccountRow({ account }: { account: WeddingAccount }) {
  async function copyAccount() {
    await navigator.clipboard.writeText(
      `${account.bank} ${account.number} ${account.holder}`,
    );
    alert("계좌번호가 복사되었어요.");
  }

  return (
    <div className="reveal border-b border-[#eee7de] py-5 text-left last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#2f2924]/70">{account.label}</p>
          <p className="mt-2 text-base font-medium text-[#332b24]">
            {account.bank} {account.number}
          </p>
          <p className="mt-1 text-sm text-[#7c6e62]">
            예금주 {account.holder}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={copyAccount}
            className="rounded-full border border-[#2f2924]/20 px-3 py-2 text-xs font-medium text-[#2f2924]"
          >
            복사
          </button>
          {account.kakaoPayUrl ? (
            <a
              href={account.kakaoPayUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#2f2924] px-3 py-2 text-center text-xs font-medium text-white"
            >
              카카오페이
            </a>
          ) : null}
        </div>
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

function ActionSection({ data, invitationSlug }: { data: WeddingData; invitationSlug?: string }) {
  const savedRsvp = data.rsvp;
  const rsvp = {
    label: savedRsvp.label || "참석 여부 전달하기",
    url: savedRsvp.url || "",
    title: savedRsvp.title || "참석 여부 전달",
    guide:
      savedRsvp.guide ||
      "결혼식에 참석해주시는 모든 분들을 더욱 특별하게 모시고자 하오니, 참석 여부 전달을 부탁드립니다.",
    usePopup: savedRsvp.usePopup ?? true,
    popupMode: savedRsvp.popupMode || ("none" as const),
    recipientEmail: savedRsvp.recipientEmail || "",
    recipientPhone: savedRsvp.recipientPhone || "",
    fields: {
      ...DEFAULT_RSVP_FIELDS,
      ...savedRsvp.fields,
    },
  };
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    category: "신랑측",
    attendance: "참석",
    meal: "식사함",
    shuttle: "미탑승",
    name: "",
    phone: "",
    companionName: "",
    companionPhone: "",
    allEvents: "",
    privacy: false,
  });

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    alert("청첩장 링크가 복사되었어요.");
  }

  function updateRsvpForm(key: keyof typeof rsvpForm, value: string | boolean) {
    setRsvpForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openRsvp() {
    setIsRsvpOpen(true);
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rsvp.fields.privacy && !rsvpForm.privacy) {
      alert("개인정보 수집 동의가 필요해요.");
      return;
    }

    if (!invitationSlug) {
      alert("미리보기에서는 저장되지 않아요. 제작본 저장 후 받은 링크에서 테스트해 주세요.");
      return;
    }

    const response: Omit<WeddingRsvpResponse, "id" | "createdAt"> = {
      category: rsvp.fields.category ? rsvpForm.category : undefined,
      attendance: rsvp.fields.attendance ? rsvpForm.attendance : undefined,
      meal: rsvp.fields.meal ? rsvpForm.meal : undefined,
      shuttle: rsvp.fields.shuttle ? rsvpForm.shuttle : undefined,
      name: rsvp.fields.name ? rsvpForm.name : undefined,
      phone: rsvp.fields.phone ? rsvpForm.phone : undefined,
      companionName: rsvp.fields.companionName ? rsvpForm.companionName : undefined,
      companionPhone: rsvp.fields.companionPhone ? rsvpForm.companionPhone : undefined,
      allEvents: rsvp.fields.allEvents ? rsvpForm.allEvents : undefined,
    };

    setIsRsvpSubmitting(true);

    try {
      const result = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: invitationSlug,
          response,
        }),
      });

      if (!result.ok) {
        const body = (await result.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "참석 여부 저장에 실패했어요.");
      }

      alert("참석 여부가 전달되었어요.");
      setIsRsvpOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "참석 여부 저장에 실패했어요.");
    } finally {
      setIsRsvpSubmitting(false);
    }
  }

  if (!data.sections.rsvp && !data.sections.share) {
    return null;
  }

  return (
    <section className="px-7 pb-16 pt-6 text-center">
      <div className="mx-auto max-w-[22rem] space-y-3">
        {data.sections.rsvp ? (
          <button
            type="button"
            onClick={openRsvp}
            className="reveal flex w-full items-center justify-center rounded-full bg-[#342526] px-6 py-4 text-sm font-medium tracking-[0.12em] text-white shadow-[0_18px_38px_rgba(52,37,38,0.18)]"
          >
            {rsvp.label}
          </button>
        ) : null}
        {data.sections.share ? (
          <button
            type="button"
            onClick={copyLink}
            className="reveal w-full rounded-full border border-[#2f2924]/18 bg-white/55 px-6 py-4 text-sm font-medium tracking-[0.12em] text-[#2f2924]"
            style={revealDelay(data.sections.rsvp ? 1 : 0)}
          >
            링크 복사하기
          </button>
        ) : null}
      </div>
      {isRsvpOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 py-8">
          <div className="max-h-[86vh] w-full max-w-[390px] overflow-y-auto bg-white px-6 py-7 text-left shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#a48b6a]">RSVP</p>
                <h3 className="mt-2 text-xl font-medium text-[#2f2924]">{rsvp.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRsvpOpen(false)}
                className="text-2xl leading-none text-[#2f2924]/65"
                aria-label="참석 여부 창 닫기"
              >
                ×
              </button>
            </div>
            <p className="mb-6 whitespace-pre-line text-sm leading-7 text-[#6f6258]">{rsvp.guide}</p>
            <form className="grid gap-4" onSubmit={submitRsvp}>
              {rsvp.fields.category ? (
                <RsvpSelect
                  label="하객분류"
                  value={rsvpForm.category}
                  options={["신랑측", "신부측", "공통 지인"]}
                  onChange={(value) => updateRsvpForm("category", value)}
                />
              ) : null}
              {rsvp.fields.attendance ? (
                <RsvpSelect
                  label="참석여부"
                  value={rsvpForm.attendance}
                  options={["참석", "불참"]}
                  onChange={(value) => updateRsvpForm("attendance", value)}
                />
              ) : null}
              {rsvp.fields.meal ? (
                <RsvpSelect
                  label="식사여부"
                  value={rsvpForm.meal}
                  options={["식사함", "식사 안 함", "미정"]}
                  onChange={(value) => updateRsvpForm("meal", value)}
                />
              ) : null}
              {rsvp.fields.shuttle ? (
                <RsvpSelect
                  label="전세버스 탑승여부"
                  value={rsvpForm.shuttle}
                  options={["탑승", "미탑승"]}
                  onChange={(value) => updateRsvpForm("shuttle", value)}
                />
              ) : null}
              {rsvp.fields.name ? (
                <RsvpInput label="성함" value={rsvpForm.name} onChange={(value) => updateRsvpForm("name", value)} />
              ) : null}
              {rsvp.fields.phone ? (
                <RsvpInput label="연락처" value={rsvpForm.phone} onChange={(value) => updateRsvpForm("phone", value)} />
              ) : null}
              {rsvp.fields.companionName ? (
                <RsvpInput
                  label="동행인 성함"
                  value={rsvpForm.companionName}
                  onChange={(value) => updateRsvpForm("companionName", value)}
                />
              ) : null}
              {rsvp.fields.companionPhone ? (
                <RsvpInput
                  label="동행인 수"
                  value={rsvpForm.companionPhone}
                  onChange={(value) => updateRsvpForm("companionPhone", value)}
                />
              ) : null}
              {rsvp.fields.allEvents ? (
                <label className="grid gap-2 text-sm text-[#4f453d]">
                  <span>전달 사항</span>
                  <textarea
                    value={rsvpForm.allEvents}
                    onChange={(event) => updateRsvpForm("allEvents", event.target.value)}
                    rows={3}
                    className="border border-[#e4d8ca] bg-white px-3 py-3 text-sm outline-none focus:border-[#b29467]"
                  />
                </label>
              ) : null}
              {rsvp.fields.privacy ? (
                <label className="flex items-center gap-2 text-xs text-[#6f6258]">
                  <input
                    type="checkbox"
                    checked={rsvpForm.privacy}
                    onChange={(event) => updateRsvpForm("privacy", event.target.checked)}
                  />
                  개인정보 수집 및 참석 여부 전달에 동의합니다.
                </label>
              ) : null}
              <button
                type="submit"
                disabled={isRsvpSubmitting}
                className="mt-2 rounded-full bg-[#342526] px-5 py-4 text-sm font-medium text-white disabled:opacity-45"
              >
                {isRsvpSubmitting ? "저장 중..." : "참석 여부 보내기"}
              </button>
              {rsvp.recipientPhone ? (
                <a href={`tel:${rsvp.recipientPhone}`} className="text-center text-xs text-[#7c6e62] underline underline-offset-4">
                  전화로 전달하기
                </a>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RsvpInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-[#4f453d]">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border border-[#e4d8ca] bg-white px-3 py-3 text-sm outline-none focus:border-[#b29467]"
      />
    </label>
  );
}

function RsvpSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-[#4f453d]">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border border-[#e4d8ca] bg-white px-3 py-3 text-sm outline-none focus:border-[#b29467]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Footer({ data }: { data: WeddingData }) {
  return (
    <footer className="px-8 pb-14 text-center">
      <Divider />
      <p className="mx-auto mt-8 max-w-[18rem] break-keep text-sm leading-7 text-[#76695e]">
        {data.message.footer}
      </p>
      <p className="mt-8 font-['Great_Vibes'] text-4xl font-light text-[#2f2924]/75">Thank you</p>
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
        {isPlaying ? "STOP" : "PLAY"}
      </button>
    </>
  );
}

function Watermark({ data }: { data: WeddingData }) {
  if (data.payment.isPaid) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50" aria-hidden="true">
      <div className="sticky top-4 mx-auto mt-4 w-fit rounded-full border border-black/10 bg-white/88 px-4 py-2 text-[0.68rem] font-semibold tracking-[0.18em] text-[#2f2924]/72 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur">
        {data.payment.watermarkText} · 결제 후 제거
      </div>
      <div className="absolute left-1/2 top-[36rem] w-[22rem] -translate-x-1/2 -rotate-12 border-y border-[#2f2924]/10 bg-white/46 py-4 text-center text-[1.45rem] font-semibold tracking-[0.28em] text-[#2f2924]/16 backdrop-blur-[1px]">
        {data.payment.watermarkText}
      </div>
      <div className="sticky bottom-4 mx-auto mt-[80vh] mb-4 w-fit rounded-full bg-[#2f2924]/82 px-4 py-2 text-[0.65rem] font-medium tracking-[0.12em] text-white/90 shadow-[0_10px_28px_rgba(0,0,0,0.16)] backdrop-blur">
        결제 후 워터마크 제거
      </div>
    </div>
  );
}

export function WeddingInvitation({
  data,
  invitationSlug,
}: {
  data: WeddingData;
  invitationSlug?: string;
}) {
  const sections = data.sections;
  const revealKey = `${data.storyStyle.type}-${data.storyStyle.qaEnabled}-${data.storyStyle.timelineEnabled}-${data.qa.length}-${data.timeline.length}-${JSON.stringify(sections)}`;

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
      {sections.openingMessage ? <InvitationMessage data={data} /> : null}
      {sections.story && data.storyStyle.type === "default" ? <StorySection data={data} /> : null}
      {sections.qa ? <QASection data={data} /> : null}
      {sections.timeline ? <TimelineSection data={data} /> : null}
      {sections.family ? <Divider label="Together" /> : null}
      {sections.family ? <FamilySection data={data} /> : null}
      {sections.calendar ? <CalendarSection data={data} /> : null}
      {sections.location ? <Divider /> : null}
      {sections.location ? <LocationSection data={data} /> : null}
      {sections.gallery ? <GallerySection data={data} /> : null}
      {sections.accounts ? <AccountSection data={data} /> : null}
      <ActionSection data={data} invitationSlug={invitationSlug} />
      {sections.footer ? <Footer data={data} /> : null}
      <MusicButton music={data.music} />
      <Watermark data={data} />
    </main>
  );
}

