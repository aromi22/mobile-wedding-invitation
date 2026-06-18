"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { wedding } from "@/data/wedding";
import { INTRO_TEMPLATE_OPTIONS } from "@/data/introTemplates";
import type {
  InvitationStoryType,
  PhotoRatio,
  WeddingAccount,
  WeddingData,
  WeddingMusic,
  WeddingQuestionAnswer,
  WeddingRsvpFieldKey,
  WeddingRsvpResponse,
  WeddingTimelineItem,
} from "@/types/wedding";
import { WeddingInvitation } from "@/components/WeddingInvitation";
import { EDITOR_STORAGE_KEY } from "@/lib/editorStorage";
import type { InvitationRow } from "@/lib/invitations";

const COVER_IMAGE_MAX_SIZE = 1200;
const GALLERY_IMAGE_MAX_SIZE = 1000;
const IMAGE_EXPORT_QUALITY = 0.62;
const LOCAL_DRAFT_MAX_LENGTH = 3_500_000;
const PHOTO_PROCESS_ERROR_MESSAGE =
  "사진을 미리보기에 표시하지 못했어요. JPG, PNG, WebP 사진으로 다시 넣어주세요. 아이폰 HEIC 사진은 사진 앱에서 JPG로 저장한 뒤 올려주세요.";

const MUSIC_OPTIONS: Array<WeddingMusic | null> = [
  null,
  { title: "음원 1", src: "/music/music-1.mp3" },
  { title: "음원 2", src: "/music/music-2.mp3" },
  { title: "음원 3", src: "/music/music-3.mp3" },
];

const weddingHandwritingPhrases = [
  "Our Wedding Day",
  "We Got Married",
  "Just Married",
  "The Wedding Day",
  "Happily Ever After",
];

const selectedPhrase = weddingHandwritingPhrases[0];

type SaveInvitationResponse = {
  row: InvitationRow;
  editSecret: string;
};

type UnlockPaymentResponse = SaveInvitationResponse & {
  message?: string;
};

const LETTERING_FONT_OPTIONS = [
  { label: "Segoe Print", value: "segoe-print" },
  { label: "Freestyle Script", value: "freestyle-script" },
] as const;

const FULLSCREEN_CALLIGRAPHY_FONT_OPTIONS = [
  { label: "Great Vibes", value: "great-vibes" },
  { label: "Cormorant Italic", value: "cormorant" },
  { label: "Caveat", value: "caveat" },
  { label: "Freestyle Script", value: "freestyle-script" },
] as const;

const THEME_FONT_OPTIONS = [
  { label: "프리텐다드", value: "pretendard" },
  { label: "선바탕", value: "sunbatang" },
  { label: "나눔스퀘어", value: "nanumsquare" },
  { label: "강원교육체", value: "gangwon" },
  { label: "카페24 동동", value: "cafe24-dongdong" },
  { label: "주아체", value: "jua" },
  { label: "하이멜로디", value: "himelody" },
  { label: "카페24 쑥쑥", value: "cafe24-ssukssuk" },
] as const;

const PETAL_EFFECT_OPTIONS = [
  { label: "없음", value: "none", description: "꽃잎 없이 가장 미니멀하게 시작해요." },
  { label: "화이트 꽃잎", value: "soft", description: "하얀 꽃잎이 천천히 내려오는 깨끗한 분위기예요." },
  { label: "연핑크 꽃잎", value: "pink", description: "아주 옅은 핑크 톤으로 로맨틱하게 흩날려요." },
  { label: "아이보리 꽃잎", value: "sky", description: "종이 청첩장처럼 차분한 아이보리 톤이에요." },
  { label: "눈송이", value: "snow", description: "작은 눈송이가 사선으로 천천히 흘러요." },
  { label: "벚꽃", value: "cherry", description: "연핑크 벚꽃잎이 부드럽게 지나가요." },
  { label: "데이지", value: "daisy", description: "작은 데이지 꽃송이가 산뜻하게 흩날려요." },
  { label: "낙엽", value: "fall", description: "차분한 가을빛 잎이 천천히 내려와요." },
  { label: "하트", value: "heart", description: "작은 하트가 은은하게 떠내려가요." },
] as const;

type EditorTabKey = "basic" | "design" | "accounts" | "share";

const EDITOR_TABS: Array<{
  key: EditorTabKey;
  label: string;
  description: string;
  icon: string;
}> = [
  { key: "basic", label: "기본 정보", description: "이름, 예식, 가족 정보", icon: "01" },
  { key: "design", label: "디자인", description: "화면, 사진, 문구", icon: "02" },
  { key: "accounts", label: "계좌·참석", description: "마음 전하실 곳과 RSVP", icon: "03" },
  { key: "share", label: "공유 설정", description: "음악, 지도, 링크", icon: "04" },
];

type SectionToggleKey = keyof WeddingData["sections"];

const SECTION_TOGGLE_OPTIONS: Array<{
  key: SectionToggleKey;
  label: string;
}> = [
  { key: "openingMessage", label: "초대 문구" },
  { key: "story", label: "우리들의 이야기" },
  { key: "qa", label: "Q&A" },
  { key: "timeline", label: "타임라인" },
  { key: "family", label: "신랑 신부 소개" },
  { key: "calendar", label: "달력 / 예식 날짜" },
  { key: "location", label: "예식 장소 / 지도" },
  { key: "gallery", label: "갤러리" },
  { key: "accounts", label: "마음 전하실 곳" },
  { key: "rsvp", label: "참석 여부 전달" },
  { key: "share", label: "링크 공유" },
  { key: "footer", label: "감사 문구" },
];

const RSVP_FIELD_OPTIONS: Array<{ key: WeddingRsvpFieldKey; label: string }> = [
  { key: "category", label: "하객분류" },
  { key: "attendance", label: "참석여부" },
  { key: "meal", label: "식사여부" },
  { key: "shuttle", label: "전세버스 탑승여부" },
  { key: "name", label: "성함" },
  { key: "phone", label: "연락처" },
  { key: "companionName", label: "동행인 성함" },
  { key: "companionPhone", label: "동행인 수(본인 제외)" },
  { key: "privacy", label: "개인정보 수집 동의" },
  { key: "allEvents", label: "전달 사항" },
];

type EditorMode = "admin" | "public";

function normalizeCoverTemplate(
  value?: WeddingData["hero"]["coverTemplate"],
): WeddingData["hero"]["coverTemplate"] {
  if (INTRO_TEMPLATE_OPTIONS.some((template) => template.id === value)) {
    return value as WeddingData["hero"]["coverTemplate"];
  }

  if (value === "fullscreen") {
    return "modern-script";
  }

  if (value === "clean") {
    return "soft-card";
  }

  return "classic-poster";
}

function getInitialWeddingData(mode: EditorMode) {
  const initial = structuredClone(wedding);
  initial.payment = {
    ...wedding.payment,
    isPaid: mode === "admin",
  };
  return initial;
}

function splitName(name = "") {
  const trimmed = name.trim();

  if (!trimmed) {
    return { familyName: "", givenName: "" };
  }

  return {
    familyName: trimmed.slice(0, 1),
    givenName: trimmed.slice(1),
  };
}

function joinName(familyName: string, givenName: string) {
  return `${familyName}${givenName}`.trim();
}

function normalizeWeddingData(data: Partial<WeddingData>): WeddingData {
  const merged = structuredClone(wedding);
  const source = data as WeddingData;

  merged.couple = {
    groom: { ...merged.couple.groom, ...source.couple?.groom },
    bride: { ...merged.couple.bride, ...source.couple?.bride },
  };
  merged.couple.groom.profile = {
    ...wedding.couple.groom.profile,
    ...source.couple?.groom?.profile,
  };
  merged.couple.bride.profile = {
    ...wedding.couple.bride.profile,
    ...source.couple?.bride?.profile,
  };
  merged.couple.groom.parents = {
    ...merged.couple.groom.parents,
    ...source.couple?.groom?.parents,
  };
  merged.couple.bride.parents = {
    ...merged.couple.bride.parents,
    ...source.couple?.bride?.parents,
  };
  merged.couple.groom.account = {
    ...merged.couple.groom.account,
    ...source.couple?.groom?.account,
  };
  merged.couple.bride.account = {
    ...merged.couple.bride.account,
    ...source.couple?.bride?.account,
  };
  const groomNameParts = splitName(merged.couple.groom.name);
  const brideNameParts = splitName(merged.couple.bride.name);
  const groomFatherParts = splitName(merged.couple.groom.parents.father);
  const groomMotherParts = splitName(merged.couple.groom.parents.mother);
  const brideFatherParts = splitName(merged.couple.bride.parents.father);
  const brideMotherParts = splitName(merged.couple.bride.parents.mother);

  merged.couple.groom.familyName ||= groomNameParts.familyName;
  merged.couple.groom.givenName ||= groomNameParts.givenName;
  merged.couple.bride.familyName ||= brideNameParts.familyName;
  merged.couple.bride.givenName ||= brideNameParts.givenName;
  merged.couple.groom.parents.fatherFamilyName ||= groomFatherParts.familyName;
  merged.couple.groom.parents.fatherGivenName ||= groomFatherParts.givenName;
  merged.couple.groom.parents.motherFamilyName ||= groomMotherParts.familyName;
  merged.couple.groom.parents.motherGivenName ||= groomMotherParts.givenName;
  merged.couple.bride.parents.fatherFamilyName ||= brideFatherParts.familyName;
  merged.couple.bride.parents.fatherGivenName ||= brideFatherParts.givenName;
  merged.couple.bride.parents.motherFamilyName ||= brideMotherParts.familyName;
  merged.couple.bride.parents.motherGivenName ||= brideMotherParts.givenName;
  merged.couple.groom.name = joinName(merged.couple.groom.familyName, merged.couple.groom.givenName);
  merged.couple.bride.name = joinName(merged.couple.bride.familyName, merged.couple.bride.givenName);
  merged.couple.groom.parents.father = joinName(
    merged.couple.groom.parents.fatherFamilyName,
    merged.couple.groom.parents.fatherGivenName,
  );
  merged.couple.groom.parents.mother = joinName(
    merged.couple.groom.parents.motherFamilyName,
    merged.couple.groom.parents.motherGivenName,
  );
  merged.couple.bride.parents.father = joinName(
    merged.couple.bride.parents.fatherFamilyName,
    merged.couple.bride.parents.fatherGivenName,
  );
  merged.couple.bride.parents.mother = joinName(
    merged.couple.bride.parents.motherFamilyName,
    merged.couple.bride.parents.motherGivenName,
  );
  merged.event = { ...merged.event, ...source.event };
  merged.message = { ...merged.message, ...source.message };
  merged.photos = {
    cover: { ...merged.photos.cover, ...source.photos?.cover },
    intro: { ...merged.photos.intro, ...source.photos?.intro },
    venue: { ...merged.photos.venue, ...source.photos?.venue },
    childhoodIllustration: {
      ...merged.photos.childhoodIllustration,
      ...source.photos?.childhoodIllustration,
    },
    groomChildPhoto: { ...merged.photos.groomChildPhoto, ...source.photos?.groomChildPhoto },
    brideChildPhoto: { ...merged.photos.brideChildPhoto, ...source.photos?.brideChildPhoto },
    gallery: source.photos?.gallery?.length ? source.photos.gallery : merged.photos.gallery,
  };
  merged.hero = {
    ...merged.hero,
    ...source.hero,
    themeFont: source.hero?.themeFont ?? merged.hero.themeFont ?? "gangwon",
    coverTemplate: normalizeCoverTemplate(source.hero?.coverTemplate ?? merged.hero.coverTemplate),
    petalEffect: source.hero?.petalEffect ?? merged.hero.petalEffect ?? "none",
    fullscreenCalligraphyEnabled:
      source.hero?.fullscreenCalligraphyEnabled ?? merged.hero.fullscreenCalligraphyEnabled ?? true,
    fullscreenCalligraphyText:
      source.hero?.fullscreenCalligraphyText ?? merged.hero.fullscreenCalligraphyText ?? "Our Wedding Day",
    fullscreenCalligraphyFont:
      source.hero?.fullscreenCalligraphyFont ?? merged.hero.fullscreenCalligraphyFont ?? "great-vibes",
    fullscreenCalligraphyColor:
      source.hero?.fullscreenCalligraphyColor ?? merged.hero.fullscreenCalligraphyColor ?? "#ffffff",
    fullscreenCalligraphyTop:
      source.hero?.fullscreenCalligraphyTop ?? merged.hero.fullscreenCalligraphyTop ?? 42,
    fullscreenCalligraphyLeft:
      source.hero?.fullscreenCalligraphyLeft ?? merged.hero.fullscreenCalligraphyLeft ?? 50,
    fullscreenCalligraphySize:
      source.hero?.fullscreenCalligraphySize ?? merged.hero.fullscreenCalligraphySize ?? 64,
    introEnglishMessage:
      source.hero?.introEnglishMessage ?? merged.hero.introEnglishMessage ?? "We're getting married",
    introSubMessage:
      source.hero?.introSubMessage ?? merged.hero.introSubMessage ?? "You are joyfully invited",
    introInvitationMessage:
      source.hero?.introInvitationMessage ?? merged.hero.introInvitationMessage ?? "소중한 분들을 초대합니다",
    mainText: source.hero?.mainText ?? source.message?.coverLine ?? merged.hero.mainText,
  };
  merged.sections = {
    ...merged.sections,
    ...source.sections,
  };
  merged.payment = {
    ...merged.payment,
    ...source.payment,
  };
  merged.stories = source.stories?.length ? source.stories : merged.stories;
  merged.storyStyle = {
    ...merged.storyStyle,
    ...source.storyStyle,
  };
  merged.familySettings = {
    ...merged.familySettings,
    ...source.familySettings,
  };
  merged.qa = source.qa?.length ? source.qa : merged.qa;
  merged.timeline = source.timeline?.length ? source.timeline : merged.timeline;
  merged.music = source.music ?? merged.music;
  merged.rsvp = {
    ...merged.rsvp,
    ...source.rsvp,
    fields: {
      ...merged.rsvp.fields,
      ...source.rsvp?.fields,
    },
  };
  merged.accounts = source.accounts?.length
    ? source.accounts
    : [
        {
          id: "groom",
          side: "groom",
          label: "신랑",
          ...merged.couple.groom.account,
        },
        {
          id: "bride",
          side: "bride",
          label: "신부",
          ...merged.couple.bride.account,
        },
      ];

  return merged;
}

function getDateInputValue(data: WeddingData) {
  return `${data.event.year}-${String(data.event.month).padStart(2, "0")}-${String(
    data.event.day,
  ).padStart(2, "0")}`;
}

function formatDate(dateValue: string, time: string) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const shortWeekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  const shortWeekday = shortWeekdays[date.getDay()];

  return {
    year,
    month,
    day,
    weekday,
    dateText: `${year}년 ${month}월 ${day}일 ${weekday} ${time}`,
    calendarText: `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(
      2,
      "0",
    )} ${shortWeekday} ${time}`,
  };
}

function detectRatio(src: string, index: number): PhotoRatio {
  if (src.toLowerCase().includes("landscape") || index === 4) {
    return "landscape";
  }

  return "portrait";
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  description?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-[13px] text-[#555]">
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-[#d6a2ad]">*</span> : null}
      </span>
      {description ? <span className="text-xs leading-5 text-[#888]">{description}</span> : null}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-[15px] text-[#191919] outline-none transition focus:border-[#191919]"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-[13px] text-[#555]">
      <span className="font-medium">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 resize-y rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-[15px] leading-7 text-[#191919] outline-none transition focus:border-[#191919]"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff";

  return (
    <label className="grid min-w-0 gap-2 text-[13px] text-[#555]">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3 rounded-[10px] border border-[#dedede] bg-white px-3 py-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={`${label} 컬러 선택`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[15px] text-[#191919] outline-none"
          placeholder="#ffffff"
        />
      </div>
    </label>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-[13px] text-[#555]">
      <span className="flex items-center justify-between gap-3">
        <span className="font-medium">{label}</span>
        <strong className="rounded-full bg-[#f3e0e4] px-2.5 py-1 text-xs font-medium text-[#191919]">
          {value}
          {suffix}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 accent-[#191919]"
      />
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-w-0 items-center justify-between gap-4 rounded-[14px] border border-[#dedede] bg-white px-4 py-3 text-sm text-[#191919]">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#191919]"
      />
    </label>
  );
}

function FormSection({
  title,
  children,
  isVisible = true,
}: {
  title: string;
  children: React.ReactNode;
  isVisible?: boolean;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className="min-w-0 rounded-[18px] border border-[#dedede] bg-white p-6">
      <div className="mb-6 flex items-center justify-between border-b border-[#ececec] pb-4">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#191919]">{title}</h2>
        <span className="text-xl leading-none text-[#777]">⌄</span>
      </div>
      <div className="grid min-w-0 gap-5">{children}</div>
    </section>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러오지 못했습니다."));
    };
    image.src = objectUrl;
  });
}

async function compressImageFile(file: File, maxSize: number) {
  if (!file.type.startsWith("image/")) {
    throw new Error(PHOTO_PROCESS_ERROR_MESSAGE);
  }

  try {
    const image = await loadImageFromFile(file);
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return fileToDataUrl(file);
    }

    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#fffaf3";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", IMAGE_EXPORT_QUALITY);
  } catch {
    throw new Error(PHOTO_PROCESS_ERROR_MESSAGE);
  }
}

function isInlineImage(src: string) {
  return src.startsWith("data:image/") || src.startsWith("blob:");
}

function galleryPhotosToText(photos: WeddingData["photos"]["gallery"]) {
  return photos
    .map((photo) => photo.src)
    .filter((src) => src && !isInlineImage(src))
    .join("\n");
}

function createLocalStorageDraft(draft: WeddingData) {
  const fullJson = JSON.stringify(draft);

  if (fullJson.length <= LOCAL_DRAFT_MAX_LENGTH) {
    return { json: fullJson, isLightweight: false };
  }

  const lightweight = structuredClone(draft);
  const photos = [
    lightweight.photos.cover,
    lightweight.photos.intro,
    lightweight.photos.venue,
    lightweight.photos.groomChildPhoto,
    lightweight.photos.brideChildPhoto,
  ];

  photos.forEach((photo) => {
    if (isInlineImage(photo.src)) {
      photo.src = "";
    }
  });

  lightweight.photos.gallery = lightweight.photos.gallery.map((photo) => ({
    ...photo,
    src: isInlineImage(photo.src) ? "" : photo.src,
  }));
  lightweight.stories = lightweight.stories.map((story) => ({
    ...story,
    image: isInlineImage(story.image) ? "" : story.image,
  }));

  return { json: JSON.stringify(lightweight), isLightweight: true };
}

function FileField({
  label,
  onSelect,
  multiple = false,
}: {
  label: string;
  onSelect: (files: FileList) => void;
  multiple?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-[#5f5349]">
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(event) => {
          if (event.target.files?.length) {
            onSelect(event.target.files);
            event.currentTarget.value = "";
          }
        }}
        className="rounded-md border border-dashed border-[#d8c6ab] bg-white px-3 py-3 text-sm text-[#806b4f] file:mr-3 file:rounded-full file:border-0 file:bg-[#b29467] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
      />
    </label>
  );
}

function AccountEditor({
  account,
  onChange,
  onRemove,
}: {
  account: WeddingAccount;
  onChange: (account: WeddingAccount) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#eadfcd] bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <strong className="text-sm text-[#332b24]">{account.label || "새 계좌"}</strong>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-[#e0cfc0] px-3 py-1.5 text-xs text-[#806b4f]"
        >
          삭제
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="표시 이름"
          value={account.label}
          placeholder="예: 신랑 아버님"
          onChange={(value) => onChange({ ...account, label: value })}
        />
        <label className="grid gap-2 text-sm text-[#5f5349]">
          <span>구분</span>
          <select
            value={account.side}
            onChange={(event) =>
              onChange({ ...account, side: event.target.value as WeddingAccount["side"] })
            }
            className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
          >
            <option value="groom">신랑측</option>
            <option value="bride">신부측</option>
            <option value="etc">기타</option>
          </select>
        </label>
        <Field
          label="은행"
          value={account.bank}
          onChange={(value) => onChange({ ...account, bank: value })}
        />
        <Field
          label="계좌번호"
          value={account.number}
          onChange={(value) => onChange({ ...account, number: value })}
        />
        <Field
          label="예금주"
          value={account.holder}
          onChange={(value) => onChange({ ...account, holder: value })}
        />
        <div className="sm:col-span-2">
          <Field
            label="카카오페이 송금 링크"
            value={account.kakaoPayUrl ?? ""}
            placeholder="https://qr.kakaopay.com/..."
            onChange={(value) => onChange({ ...account, kakaoPayUrl: value })}
          />
          <p className="mt-1 text-xs leading-5 text-[#8a7a6a]">
            입력하면 청첩장에 카카오페이로 보내기 버튼이 표시돼요.
          </p>
        </div>
      </div>
    </div>
  );
}

function QAEditor({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: WeddingQuestionAnswer;
  index: number;
  onChange: (item: WeddingQuestionAnswer) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#eadfcd] bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <strong className="text-sm text-[#332b24]">질문 {index + 1}</strong>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-[#e0cfc0] px-3 py-1.5 text-xs text-[#806b4f]"
        >
          삭제
        </button>
      </div>
      <div className="grid gap-3">
        <Field
          label="질문"
          value={item.question}
          onChange={(value) => onChange({ ...item, question: value })}
        />
        <TextArea
          label="답변"
          value={item.answer}
          rows={3}
          onChange={(value) => onChange({ ...item, answer: value })}
        />
      </div>
    </div>
  );
}

function TimelineEditor({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: WeddingTimelineItem;
  index: number;
  onChange: (item: WeddingTimelineItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#eadfcd] bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <strong className="text-sm text-[#332b24]">스토리 {index + 1}</strong>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-[#e0cfc0] px-3 py-1.5 text-xs text-[#806b4f]"
        >
          삭제
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="제목"
          value={item.title}
          onChange={(value) => onChange({ ...item, title: value })}
        />
        <Field
          label="시점/날짜"
          value={item.date}
          onChange={(value) => onChange({ ...item, date: value })}
        />
        <div className="sm:col-span-2">
          <TextArea
            label="내용"
            value={item.body}
            rows={3}
            onChange={(value) => onChange({ ...item, body: value })}
          />
        </div>
      </div>
    </div>
  );
}

function ParentNameFields({
  title,
  familyName,
  givenName,
  deceased,
  onFamilyNameChange,
  onGivenNameChange,
  onDeceasedChange,
}: {
  title: string;
  familyName: string;
  givenName: string;
  deceased: boolean;
  onFamilyNameChange: (value: string) => void;
  onGivenNameChange: (value: string) => void;
  onDeceasedChange: (value: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-[#eadfcd] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <strong className="text-sm text-[#332b24]">{title}</strong>
        <label className="flex items-center gap-2 text-xs text-[#806b4f]">
          <input
            type="checkbox"
            checked={deceased}
            onChange={(event) => onDeceasedChange(event.target.checked)}
            className="h-4 w-4 accent-[#b29467]"
          />
          고인
        </label>
      </div>
      <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
        <Field label="성" value={familyName} onChange={onFamilyNameChange} />
        <Field label="이름" value={givenName} onChange={onGivenNameChange} />
      </div>
    </div>
  );
}

export function EditInvitation({
  slug,
  mode = "admin",
  initialData,
  initialEditSecret = "",
  initialLoadMessage = "",
  canMarkPaid = false,
  adminPaymentKey = "",
}: {
  slug?: string;
  mode?: EditorMode;
  initialData?: WeddingData;
  initialEditSecret?: string;
  initialLoadMessage?: string;
  canMarkPaid?: boolean;
  adminPaymentKey?: string;
}) {
  const initialDraft = useMemo(() => {
    if (initialData) {
      return structuredClone(initialData);
    }

    return getInitialWeddingData(mode);
  }, [initialData, mode]);
  const storageKey = mode === "public" ? PUBLIC_MAKE_STORAGE_KEY : EDITOR_STORAGE_KEY;
  const [draft, setDraft] = useState<WeddingData>(initialDraft);
  const [dateValue, setDateValue] = useState(getDateInputValue(initialDraft));
  const [galleryText, setGalleryText] = useState(galleryPhotosToText(initialDraft.photos.gallery));
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingPhotoCount, setProcessingPhotoCount] = useState(0);
  const [isUnlockingPayment, setIsUnlockingPayment] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [manualCopyText, setManualCopyText] = useState("");
  const [paymentOrderNumber, setPaymentOrderNumber] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [currentSlug, setCurrentSlug] = useState(slug ?? "");
  const [editSecret, setEditSecret] = useState(initialEditSecret);
  const [rsvpResponses, setRsvpResponses] = useState<WeddingRsvpResponse[]>([]);
  const [rsvpResponseMessage, setRsvpResponseMessage] = useState("");
  const [rsvpRefreshKey, setRsvpRefreshKey] = useState(0);
  const [openSectionKey, setOpenSectionKey] = useState<SectionToggleKey>("openingMessage");
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTabKey>("basic");
  const [previewReplayKey, setPreviewReplayKey] = useState(0);
  const isCustomerEditPage = Boolean(slug);
  const isPublicMakePage = mode === "public" && !slug;
  const isProcessingPhoto = processingPhotoCount > 0;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);

  function scrollToPreview() {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToEditor() {
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showToast(message: string) {
    setToastMessage(message);
  }

  function saveDraftNow() {
    setSaveMessage("임시 저장됐어요. 이 브라우저에서 이어서 수정할 수 있어요.");
    showToast("저장됐어요.");
  }

  async function copyToClipboard(text: string, label = "복사") {
    setManualCopyText("");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      showToast(`${label} 완료`);
    } catch {
      setManualCopyText(text);
      showToast("자동 복사가 막혔어요. 아래 링크 칸에서 복사해 주세요.");
    }
  }

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setToastMessage(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  useEffect(() => {
    if (slug) {
      const params = new URLSearchParams(window.location.search);
      const targetSecret = params.get("key") ?? params.get("secret") ?? "";

      if (initialData) {
        const parsed = normalizeWeddingData(initialData);
        setDraft(parsed);
        setDateValue(getDateInputValue(parsed));
        setGalleryText(galleryPhotosToText(parsed.photos.gallery));
        setShareUrl(`${window.location.origin}/w/${slug}`);
        setEditUrl("");
      }

      setCurrentSlug(slug);
      setEditSecret(initialEditSecret || targetSecret);
      setSaveMessage(initialLoadMessage);
      setIsLoaded(true);
      return;
    }

    const saved = window.localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = normalizeWeddingData(JSON.parse(saved) as Partial<WeddingData>);
        if (isPublicMakePage) {
          parsed.payment.isPaid = false;
        }
        setDraft(parsed);
        setDateValue(getDateInputValue(parsed));
        setGalleryText(galleryPhotosToText(parsed.photos.gallery));
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    setIsLoaded(true);
  }, [initialData, initialEditSecret, initialLoadMessage, isPublicMakePage, slug, storageKey]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      const localDraft = createLocalStorageDraft(draft);
      window.localStorage.setItem(storageKey, localDraft.json);

      if (localDraft.isLightweight) {
        setSaveMessage(
          "사진은 미리보기에 반영됐어요. 사진이 많아서 임시저장은 가볍게 처리했고, 최종 저장은 저장 버튼을 눌러주세요.",
        );
      }
    } catch {
      setSaveMessage(
        "사진은 미리보기에 반영됐어요. 이 기기에는 임시저장을 못 했으니 저장 버튼을 눌러 서버에 저장해 주세요.",
      );
    }
  }, [draft, isLoaded, storageKey]);

  useEffect(() => {
    if (!slug || !editSecret) {
      setRsvpResponses([]);
      return;
    }

    async function loadRsvpResponses() {
      setRsvpResponseMessage("참석 여부 응답을 불러오는 중이에요.");

      try {
        const result = await fetch(
          `/api/rsvp?slug=${encodeURIComponent(slug ?? "")}&key=${encodeURIComponent(editSecret)}`,
          {
            cache: "no-store",
          },
        );

        if (!result.ok) {
          const body = (await result.json().catch(() => null)) as { message?: string } | null;
          throw new Error(body?.message ?? "참석 여부 응답을 불러오지 못했어요.");
        }

        const body = (await result.json()) as { responses?: WeddingRsvpResponse[] };
        const responses = body.responses ?? [];
        setRsvpResponses(responses);
        setRsvpResponseMessage(
          responses.length ? `총 ${responses.length}개의 응답이 도착했어요.` : "아직 도착한 응답이 없어요.",
        );
      } catch (error) {
        setRsvpResponseMessage(
          error instanceof Error ? error.message : "참석 여부 응답을 불러오지 못했어요.",
        );
      }
    }

    void loadRsvpResponses();
  }, [editSecret, rsvpRefreshKey, slug]);

  const preview = useMemo(() => draft, [draft]);

  function update(mutator: (current: WeddingData) => WeddingData) {
    setDraft((current) => mutator(structuredClone(current)));
  }

  function updatePersonName(side: "groom" | "bride", familyName: string, givenName: string) {
    update((current) => {
      const person = current.couple[side];
      person.familyName = familyName;
      person.givenName = givenName;
      person.name = joinName(familyName, givenName);
      person.account.holder = person.name;
      return current;
    });
  }

  function updateParentName(
    side: "groom" | "bride",
    parent: "father" | "mother",
    familyName: string,
    givenName: string,
  ) {
    update((current) => {
      const parents = current.couple[side].parents;
      parents[`${parent}FamilyName`] = familyName;
      parents[`${parent}GivenName`] = givenName;
      parents[parent] = joinName(familyName, givenName);
      return current;
    });
  }

  function updateDate(nextDate: string) {
    setDateValue(nextDate);
    update((current) => {
      const formatted = formatDate(nextDate, current.event.time);

      if (!formatted) {
        return current;
      }

      current.event = { ...current.event, ...formatted };
      return current;
    });
  }

  function updateTime(nextTime: string) {
    update((current) => {
      const formatted = formatDate(dateValue, nextTime);
      current.event.time = nextTime;

      if (formatted) {
        current.event = { ...current.event, ...formatted, time: nextTime };
      }

      return current;
    });
  }

  function updateGallery(value: string) {
    setGalleryText(value);
    update((current) => {
      const urls = value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 50);

      current.photos.gallery = urls.map((src, index) => ({
        src,
        alt: `갤러리 사진 ${index + 1}`,
        ratio: detectRatio(src, index),
      }));
      return current;
    });
  }

  async function updateCoverFile(files: FileList) {
    const file = files[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    update((current) => {
      current.photos.cover.src = previewUrl;
      current.photos.cover.alt = file.name;
      return current;
    });
    setProcessingPhotoCount((count) => count + 1);
    setSaveMessage("메인 사진을 미리보기에 반영했어요. 저장용으로 줄이는 중이에요.");

    try {
      const dataUrl = await compressImageFile(file, COVER_IMAGE_MAX_SIZE);
      update((current) => {
        current.photos.cover.src = dataUrl;
        current.photos.cover.alt = file.name;
        return current;
      });
      setSaveMessage("메인 사진을 바꿨어요.");
    } catch {
      setSaveMessage(PHOTO_PROCESS_ERROR_MESSAGE);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setProcessingPhotoCount((count) => Math.max(0, count - 1));
    }
  }

  async function updateSinglePhotoFile(
    photoKey: "intro" | "venue",
    files: FileList,
    label: string,
  ) {
    const file = files[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    update((current) => {
      current.photos[photoKey].src = previewUrl;
      current.photos[photoKey].alt = file.name;
      current.photos[photoKey].ratio = "portrait";
      return current;
    });
    setProcessingPhotoCount((count) => count + 1);
    setSaveMessage(`${label}을 미리보기에 반영했어요. 저장용으로 줄이는 중이에요.`);

    try {
      const dataUrl = await compressImageFile(file, GALLERY_IMAGE_MAX_SIZE);
      update((current) => {
        current.photos[photoKey].src = dataUrl;
        current.photos[photoKey].alt = file.name;
        current.photos[photoKey].ratio = "portrait";
        return current;
      });
      setSaveMessage(`${label}을 바꿨어요.`);
    } catch {
      setSaveMessage(PHOTO_PROCESS_ERROR_MESSAGE);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setProcessingPhotoCount((count) => Math.max(0, count - 1));
    }
  }

  async function updateChildPhotoFile(side: "groom" | "bride", files: FileList) {
    const file = files[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    update((current) => {
      const photo = side === "groom" ? current.photos.groomChildPhoto : current.photos.brideChildPhoto;
      photo.src = previewUrl;
      photo.alt = file.name;
      photo.ratio = "portrait";
      photo.scale = photo.scale ?? 1;
      return current;
    });
    setProcessingPhotoCount((count) => count + 1);
    setSaveMessage("어릴 적 사진을 미리보기에 반영했어요. 저장용으로 줄이는 중이에요.");

    try {
      const dataUrl = await compressImageFile(file, GALLERY_IMAGE_MAX_SIZE);
      update((current) => {
        const photo = side === "groom" ? current.photos.groomChildPhoto : current.photos.brideChildPhoto;
        photo.src = dataUrl;
        photo.alt = file.name;
        photo.ratio = "portrait";
        photo.scale = photo.scale ?? 1;
        return current;
      });
      setSaveMessage("어릴 적 사진이 바뀌었어요.");
    } catch {
      setSaveMessage(PHOTO_PROCESS_ERROR_MESSAGE);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setProcessingPhotoCount((count) => Math.max(0, count - 1));
    }
  }

  function updateChildPhotoScale(side: "groom" | "bride", scale: number) {
    update((current) => {
      const photo = side === "groom" ? current.photos.groomChildPhoto : current.photos.brideChildPhoto;
      photo.scale = scale;
      return current;
    });
  }

  async function updateStoryFile(index: number, files: FileList) {
    const file = files[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    update((current) => {
      current.stories[index].image = previewUrl;
      current.stories[index].ratio = "portrait";
      return current;
    });
    setProcessingPhotoCount((count) => count + 1);
    setSaveMessage("이야기 사진을 미리보기에 반영했어요. 저장용으로 줄이는 중이에요.");

    try {
      const dataUrl = await compressImageFile(file, GALLERY_IMAGE_MAX_SIZE);
      update((current) => {
        current.stories[index].image = dataUrl;
        current.stories[index].ratio = "portrait";
        return current;
      });
      setSaveMessage("이야기 사진을 바꿨어요.");
    } catch {
      setSaveMessage(PHOTO_PROCESS_ERROR_MESSAGE);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setProcessingPhotoCount((count) => Math.max(0, count - 1));
    }
  }

  async function appendGalleryFiles(files: FileList) {
    const selectedFiles = Array.from(files).slice(0, 50);

    if (selectedFiles.length === 0) {
      setSaveMessage("갤러리는 최대 50장까지 등록할 수 있어요.");
      return;
    }

    const previewPhotos = selectedFiles.map((file) => ({
      src: URL.createObjectURL(file),
      alt: file.name,
      ratio: "portrait" as const,
    }));

    update((current) => {
      current.photos.gallery = previewPhotos.slice(0, 50);
      setGalleryText(galleryPhotosToText(current.photos.gallery));
      return current;
    });
    setProcessingPhotoCount((count) => count + selectedFiles.length);
    setSaveMessage("갤러리 사진을 미리보기에 반영했어요. 저장용으로 줄이는 중이에요.");

    const compressedPhotos = await Promise.all(
      selectedFiles.map(async (file, index) => ({
        src: await compressImageFile(file, GALLERY_IMAGE_MAX_SIZE),
        alt: file.name,
        ratio: "portrait" as const,
        previewSrc: previewPhotos[index].src,
      })),
    ).catch(() => null);

    if (!compressedPhotos) {
      setSaveMessage(PHOTO_PROCESS_ERROR_MESSAGE);
      setProcessingPhotoCount((count) => Math.max(0, count - selectedFiles.length));
      return;
    }

    update((current) => {
      current.photos.gallery = current.photos.gallery.map((photo) => {
        const compressed = compressedPhotos.find((item) => item.previewSrc === photo.src);
        return compressed ? { src: compressed.src, alt: compressed.alt, ratio: compressed.ratio } : photo;
      });
      setGalleryText(galleryPhotosToText(current.photos.gallery));
      return current;
    });
    previewPhotos.forEach((photo) => URL.revokeObjectURL(photo.src));
    setProcessingPhotoCount((count) => Math.max(0, count - selectedFiles.length));
    setSaveMessage("갤러리 사진을 추가했어요.");
  }

  function updateAccount(index: number, account: WeddingAccount) {
    update((current) => {
      current.accounts[index] = account;
      return current;
    });
  }

  function removeAccount(index: number) {
    update((current) => {
      current.accounts.splice(index, 1);
      return current;
    });
  }

  function addAccount() {
    update((current) => {
      current.accounts.push({
        id: `account-${Date.now()}`,
        side: "groom",
        label: "새 계좌",
        bank: "",
        number: "",
        holder: "",
        kakaoPayUrl: "",
      });
      return current;
    });
  }

  function updateStoryType(type: InvitationStoryType) {
    update((current) => {
      current.storyStyle.type = type;
      return current;
    });
  }

  function updateQA(index: number, item: WeddingQuestionAnswer) {
    update((current) => {
      current.qa[index] = item;
      return current;
    });
  }

  function addQA() {
    update((current) => {
      current.qa.push({
        id: `qa-${Date.now()}`,
        question: "새 질문을 입력해주세요.",
        answer: "답변을 입력해주세요.",
      });
      return current;
    });
  }

  function removeQA(index: number) {
    update((current) => {
      current.qa.splice(index, 1);
      return current;
    });
  }

  function updateTimeline(index: number, item: WeddingTimelineItem) {
    update((current) => {
      current.timeline[index] = item;
      return current;
    });
  }

  function addTimeline() {
    update((current) => {
      current.timeline.push({
        id: `timeline-${Date.now()}`,
        title: "새 이야기",
        date: "시점",
        body: "내용을 입력해주세요.",
      });
      return current;
    });
  }

  function removeTimeline(index: number) {
    update((current) => {
      current.timeline.splice(index, 1);
      return current;
    });
  }

  function renderSectionEditor(sectionKey: SectionToggleKey) {
    switch (sectionKey) {
      case "openingMessage":
        return (
          <div className="grid gap-3">
            <TextArea
              label="초대 문구"
              value={draft.message.opening}
              rows={4}
              onChange={(value) =>
                update((current) => {
                  current.message.opening = value;
                  return current;
                })
              }
            />
            <TextArea
              label="본문 문구"
              value={draft.message.body}
              rows={4}
              onChange={(value) =>
                update((current) => {
                  current.message.body = value;
                  return current;
                })
              }
            />
          </div>
        );
      case "story":
        return (
          <div className="grid gap-4">
            {draft.stories.map((story, index) => (
              <div key={`${story.title}-${index}`} className="grid gap-3 rounded-lg border border-[#eadfcd] p-3">
                <Field
                  label={`이야기 ${index + 1} 제목`}
                  value={story.title}
                  onChange={(value) =>
                    update((current) => {
                      current.stories[index].title = value;
                      return current;
                    })
                  }
                />
                <Field
                  label="사진 URL"
                  value={story.image}
                  onChange={(value) =>
                    update((current) => {
                      current.stories[index].image = value;
                      return current;
                    })
                  }
                />
                <FileField label="이야기 사진 첨부" onSelect={(files) => updateStoryFile(index, files)} />
                <TextArea
                  label="내용"
                  value={story.body}
                  rows={3}
                  onChange={(value) =>
                    update((current) => {
                      current.stories[index].body = value;
                      return current;
                    })
                  }
                />
              </div>
            ))}
          </div>
        );
      case "qa":
        return (
          <div className="grid gap-4">
            <ToggleField
              label="Q&A형으로 보여주기"
              checked={draft.storyStyle.type === "qa" && draft.storyStyle.qaEnabled}
              onChange={(checked) =>
                update((current) => {
                  current.storyStyle.type = checked ? "qa" : "default";
                  current.storyStyle.qaEnabled = checked;
                  return current;
                })
              }
            />
            {draft.qa.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-lg border border-[#eadfcd] p-3">
                <Field
                  label={`질문 ${index + 1}`}
                  value={item.question}
                  onChange={(value) => updateQA(index, { ...item, question: value })}
                />
                <TextArea
                  label="답변"
                  value={item.answer}
                  rows={3}
                  onChange={(value) => updateQA(index, { ...item, answer: value })}
                />
                <button
                  type="button"
                  onClick={() => removeQA(index)}
                  className="justify-self-end text-xs font-semibold text-[#8a7a6a] underline underline-offset-4"
                >
                  삭제
                </button>
              </div>
            ))}
            <button type="button" onClick={addQA} className="rounded-full border border-[#d8c6ab] px-4 py-3 text-sm text-[#806b4f]">
              Q&A 추가
            </button>
          </div>
        );
      case "timeline":
        return (
          <div className="grid gap-4">
            <ToggleField
              label="타임라인형으로 보여주기"
              checked={draft.storyStyle.type === "timeline" && draft.storyStyle.timelineEnabled}
              onChange={(checked) =>
                update((current) => {
                  current.storyStyle.type = checked ? "timeline" : "default";
                  current.storyStyle.timelineEnabled = checked;
                  return current;
                })
              }
            />
            {draft.timeline.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-lg border border-[#eadfcd] p-3">
                <Field label="제목" value={item.title} onChange={(value) => updateTimeline(index, { ...item, title: value })} />
                <Field label="시점 / 날짜" value={item.date} onChange={(value) => updateTimeline(index, { ...item, date: value })} />
                <TextArea label="내용" value={item.body} rows={3} onChange={(value) => updateTimeline(index, { ...item, body: value })} />
                <button
                  type="button"
                  onClick={() => removeTimeline(index)}
                  className="justify-self-end text-xs font-semibold text-[#8a7a6a] underline underline-offset-4"
                >
                  삭제
                </button>
              </div>
            ))}
            <button type="button" onClick={addTimeline} className="rounded-full border border-[#d8c6ab] px-4 py-3 text-sm text-[#806b4f]">
              타임라인 추가
            </button>
          </div>
        );
      case "family":
        return (
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="신랑 성" value={draft.couple.groom.familyName} onChange={(value) => updatePersonName("groom", value, draft.couple.groom.givenName)} />
              <Field label="신랑 이름" value={draft.couple.groom.givenName} onChange={(value) => updatePersonName("groom", draft.couple.groom.familyName, value)} />
              <Field label="신부 성" value={draft.couple.bride.familyName} onChange={(value) => updatePersonName("bride", value, draft.couple.bride.givenName)} />
              <Field label="신부 이름" value={draft.couple.bride.givenName} onChange={(value) => updatePersonName("bride", draft.couple.bride.familyName, value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="신랑 관계명"
                value={draft.couple.groom.parents.relation}
                onChange={(value) =>
                  update((current) => {
                    current.couple.groom.parents.relation = value;
                    return current;
                  })
                }
              />
              <Field
                label="신부 관계명"
                value={draft.couple.bride.parents.relation}
                onChange={(value) =>
                  update((current) => {
                    current.couple.bride.parents.relation = value;
                    return current;
                  })
                }
              />
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="grid gap-4">
            {(["groom", "bride"] as const).map((side) => {
              const person = draft.couple[side];
              const sideLabel = side === "groom" ? "신랑" : "신부";

              return (
                <div key={side} className="grid gap-3 rounded-[14px] border border-[#ededed] bg-[#fafafa] p-4">
                  <p className="text-sm font-semibold text-[#191919]">{sideLabel} 프로필 정보</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="출생년도"
                      value={person.profile.birthYear}
                      onChange={(value) =>
                        update((current) => {
                          current.couple[side].profile.birthYear = value;
                          return current;
                        })
                      }
                    />
                    <Field
                      label="지역"
                      value={person.profile.hometown}
                      onChange={(value) =>
                        update((current) => {
                          current.couple[side].profile.hometown = value;
                          return current;
                        })
                      }
                    />
                    <Field
                      label="MBTI"
                      value={person.profile.mbti}
                      onChange={(value) =>
                        update((current) => {
                          current.couple[side].profile.mbti = value;
                          return current;
                        })
                      }
                    />
                    <Field
                      label="한 줄 소개"
                      value={person.profile.intro}
                      onChange={(value) =>
                        update((current) => {
                          current.couple[side].profile.intro = value;
                          return current;
                        })
                      }
                    />
                  </div>
                  <Field
                    label="관계 별명"
                    value={person.profile.relationship}
                    onChange={(value) =>
                      update((current) => {
                        current.couple[side].profile.relationship = value;
                        return current;
                      })
                    }
                  />
                  <Field
                    label="해시태그"
                    value={person.profile.tags.join(", ")}
                    placeholder="운동광, 계획적인남자"
                    onChange={(value) =>
                      update((current) => {
                        current.couple[side].profile.tags = value
                          .split(",")
                          .map((tag) => tag.trim().replace(/^#/, ""))
                          .filter(Boolean);
                        return current;
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        );
      case "calendar":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="예식 날짜" type="date" value={dateValue} onChange={updateDate} />
            <Field label="예식 시간" type="time" value={draft.event.time} onChange={updateTime} />
          </div>
        );
      case "location":
        return (
          <div className="grid gap-3">
            <Field
              label="예식 장소"
              value={draft.event.venue}
              onChange={(value) =>
                update((current) => {
                  current.event.venue = value;
                  return current;
                })
              }
            />
            <Field
              label="주소"
              value={draft.event.address}
              onChange={(value) =>
                update((current) => {
                  current.event.address = value;
                  return current;
                })
              }
            />
            <Field
              label="지도 링크"
              value={draft.event.mapUrl}
              onChange={(value) =>
                update((current) => {
                  current.event.mapUrl = value;
                  return current;
                })
              }
            />
          </div>
        );
      case "gallery":
        return (
          <div className="grid gap-3">
            <FileField label="갤러리 사진 첨부" multiple onSelect={appendGalleryFiles} />
            <TextArea label="갤러리 이미지 URL" value={galleryText} rows={6} onChange={updateGallery} />
            <p className="text-xs leading-5 text-[#8a7a6a]">최대 50장까지 등록할 수 있어요.</p>
          </div>
        );
      case "accounts":
        return (
          <div className="grid gap-4">
            {draft.accounts.map((account, index) => (
              <AccountEditor
                key={account.id}
                account={account}
                onChange={(nextAccount) => updateAccount(index, nextAccount)}
                onRemove={() => removeAccount(index)}
              />
            ))}
            <button type="button" onClick={addAccount} className="rounded-full border border-[#d8c6ab] px-4 py-3 text-sm text-[#806b4f]">
              계좌 추가
            </button>
          </div>
        );
      case "rsvp":
        return (
          <div className="grid gap-4">
            <Field
              label="버튼 문구"
              value={draft.rsvp.label}
              onChange={(value) =>
                update((current) => {
                  current.rsvp.label = value;
                  return current;
                })
              }
            />
            <Field
              label="타이틀"
              value={draft.rsvp.title}
              onChange={(value) =>
                update((current) => {
                  current.rsvp.title = value;
                  return current;
                })
              }
            />
            <TextArea
              label="안내문구"
              value={draft.rsvp.guide}
              rows={5}
              onChange={(value) =>
                update((current) => {
                  current.rsvp.guide = value;
                  return current;
                })
              }
            />
            <div className="grid gap-2 rounded-xl border border-[#eadfcd] bg-white p-4">
              <p className="text-sm font-semibold text-[#332b24]">사용 항목</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {RSVP_FIELD_OPTIONS.map((option) => (
                  <label key={option.key} className="flex items-center gap-2 text-sm text-[#4d4036]">
                    <input
                      type="checkbox"
                      checked={draft.rsvp.fields[option.key]}
                      onChange={(event) =>
                        update((current) => {
                          current.rsvp.fields = {
                            ...current.rsvp.fields,
                            [option.key]: event.target.checked,
                          };
                          return current;
                        })
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-[#4d4036]">
              <input
                type="checkbox"
                checked={draft.rsvp.usePopup}
                onChange={(event) =>
                  update((current) => {
                    current.rsvp.usePopup = event.target.checked;
                    return current;
                  })
                }
              />
              <span>청첩장 안에서 팝업으로 받기</span>
            </label>
            <div className="grid gap-2">
              <p className="text-sm font-medium text-[#332b24]">팝업 사용 여부</p>
              {[
                { value: "none", label: "미사용" },
                { value: "before", label: "청첩장 접속 시 참석여부 팝업을 먼저 띄웁니다." },
                { value: "after", label: "메인에서 벗어나면 팝업을 띄웁니다." },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm text-[#4d4036]">
                  <input
                    type="radio"
                    name="rsvp-popup-mode"
                    checked={draft.rsvp.popupMode === option.value}
                    onChange={() =>
                      update((current) => {
                        current.rsvp.popupMode = option.value as WeddingData["rsvp"]["popupMode"];
                        return current;
                      })
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <Field
              label="수신받을 메일"
              value={draft.rsvp.recipientEmail}
              onChange={(value) =>
                update((current) => {
                  current.rsvp.recipientEmail = value;
                  return current;
                })
              }
            />
            <Field
              label="수신받을 전화번호"
              value={draft.rsvp.recipientPhone}
              onChange={(value) =>
                update((current) => {
                  current.rsvp.recipientPhone = value;
                  return current;
                })
              }
            />
            {isCustomerEditPage ? (
              <div className="grid gap-3 rounded-xl border border-[#eadfcd] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#332b24]">도착한 참석 여부</p>
                    <p className="mt-1 text-xs text-[#7c6e62]">{rsvpResponseMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRsvpRefreshKey((current) => current + 1)}
                    className="rounded-full border border-[#d8c6ab] px-3 py-2 text-xs text-[#806b4f]"
                  >
                    새로고침
                  </button>
                </div>
                <div className="grid gap-3">
                  {rsvpResponses.map((response) => (
                    <div key={response.id} className="rounded-lg bg-[#faf7f2] p-3 text-sm text-[#4d4036]">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-[#332b24]">
                          {response.name || "이름 없음"} · {response.attendance || "응답"}
                        </p>
                        <p className="text-[11px] text-[#9a8a78]">
                          {new Date(response.createdAt).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs leading-5 text-[#6f6258]">
                        {response.category ? <p>하객분류: {response.category}</p> : null}
                        {response.meal ? <p>식사여부: {response.meal}</p> : null}
                        {response.shuttle ? <p>전세버스: {response.shuttle}</p> : null}
                        {response.phone ? <p>연락처: {response.phone}</p> : null}
                        {response.companionName ? <p>동행인: {response.companionName}</p> : null}
                        {response.companionPhone ? <p>동행인 수: {response.companionPhone}</p> : null}
                        {response.allEvents ? <p>전달 사항: {response.allEvents}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs leading-5 text-[#7c6e62]">
                하객이 제출한 참석 여부는 저장 후 발급되는 고객용 편집 링크에서 확인할 수 있어요.
              </p>
            )}
          </div>
        );
      case "share":
        return <p className="text-sm leading-6 text-[#7c6e62]">공유하기는 청첩장 현재 주소를 복사하는 버튼이에요. 표시 여부만 선택하면 됩니다.</p>;
      case "footer":
        return (
          <TextArea
            label="푸터 감사 문구"
            value={draft.message.footer}
            rows={4}
            onChange={(value) =>
              update((current) => {
                current.message.footer = value;
                return current;
              })
            }
          />
        );
      default:
        return null;
    }
  }

  function resetDraft() {
    const nextInitial = getInitialWeddingData(mode);
    setDraft(nextInitial);
    setDateValue(getDateInputValue(nextInitial));
    setGalleryText(galleryPhotosToText(nextInitial.photos.gallery));
    setSaveMessage("");
    setShareUrl("");
    setEditUrl("");
    setCurrentSlug("");
    setEditSecret("");
    setSaveMessage("처음 샘플 상태로 돌아왔어요. 새로 내용을 입력해 주세요.");
    window.localStorage.removeItem(storageKey);
  }

  async function saveToSupabase() {
    setIsSaving(true);
    setSaveMessage("청첩장을 저장하고 있어요.");
    showToast("저장 중이에요...");

    try {
      const dataToSave = structuredClone(draft);
      if (isPublicMakePage) {
        dataToSave.payment.isPaid = false;
      }

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: dataToSave,
          slug: currentSlug || undefined,
          editSecret: editSecret || undefined,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(
          errorBody?.message ??
            "저장 서버에 연결하지 못했어요. 인터넷 연결과 Supabase 설정을 확인해 주세요.",
        );
      }

      const saved = (await response.json()) as SaveInvitationResponse;
      const nextData = saved.row.design_settings;
      const nextShareUrl = `${window.location.origin}/w/${saved.row.slug}`;
      const nextEditUrl = `${window.location.origin}/edit/${saved.row.slug}?key=${saved.editSecret}`;

      setDraft(nextData);
      setGalleryText(galleryPhotosToText(nextData.photos.gallery));
      setCurrentSlug(saved.row.slug);
      setEditSecret(saved.editSecret);
      setShareUrl(nextShareUrl);
      setEditUrl(isCustomerEditPage ? "" : nextEditUrl);
      setSaveMessage(
        isPublicMakePage
          ? "저장 완료! 워터마크가 포함된 제작본 링크가 생성됐어요."
          : "저장 완료! 아래 공유 링크가 생성됐어요.",
      );
      showToast("저장됐습니다");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "저장 중 문제가 생겼어요. Supabase 설정을 확인해주세요.",
      );
      showToast("저장에 실패했어요");
    } finally {
      setIsSaving(false);
    }
  }

  async function markAsPaidAndSave() {
    if (!currentSlug || !editSecret) {
      setSaveMessage("고객용 편집 링크로 접속해야 결제 완료 처리를 할 수 있어요.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("결제 완료 처리 중이에요. 워터마크를 제거하고 저장합니다.");

    try {
      const dataToSave = structuredClone(draft);
      dataToSave.payment.isPaid = true;

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: dataToSave,
          slug: currentSlug,
          editSecret,
          adminPaymentKey,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorBody?.message ?? "결제 완료 저장에 실패했어요.");
      }

      const saved = (await response.json()) as SaveInvitationResponse;
      const nextData = saved.row.design_settings;
      const nextShareUrl = `${window.location.origin}/w/${saved.row.slug}`;

      setDraft(nextData);
      setGalleryText(galleryPhotosToText(nextData.photos.gallery));
      setCurrentSlug(saved.row.slug);
      setEditSecret(saved.editSecret);
      setShareUrl(nextShareUrl);
      setEditUrl("");
      setSaveMessage("결제 완료 처리됐어요. 아래 보기 링크가 워터마크 없는 최종 링크입니다.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "결제 완료 처리 중 문제가 생겼어요.");
    } finally {
      setIsSaving(false);
    }
  }

  async function unlockPaymentWithOrderNumber() {
    if (!currentSlug || !editSecret) {
      setPaymentMessage("고객용 편집 링크에서만 워터마크를 제거할 수 있어요.");
      return;
    }

    if (!paymentOrderNumber.trim()) {
      setPaymentMessage("스마트스토어 주문번호를 입력해 주세요.");
      return;
    }

    setIsUnlockingPayment(true);
    setPaymentMessage("주문번호를 확인하고 있어요.");

    try {
      const response = await fetch("/api/payments/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: currentSlug,
          editSecret,
          orderNumber: paymentOrderNumber,
        }),
      });

      const body = (await response.json().catch(() => null)) as UnlockPaymentResponse | null;

      if (!response.ok || !body?.row) {
        throw new Error(body?.message ?? "주문번호 확인에 실패했어요.");
      }

      const nextData = body.row.design_settings;
      const nextShareUrl = `${window.location.origin}/w/${body.row.slug}`;

      setDraft(nextData);
      setGalleryText(galleryPhotosToText(nextData.photos.gallery));
      setCurrentSlug(body.row.slug);
      setEditSecret(body.editSecret);
      setShareUrl(nextShareUrl);
      setEditUrl("");
      setPaymentOrderNumber("");
      setPaymentMessage(body.message ?? "워터마크가 제거됐어요. 최종 링크를 공유해 주세요.");
      setSaveMessage("워터마크 제거 완료! 아래 보기 링크가 최종 링크입니다.");
    } catch (error) {
      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "워터마크 제거 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsUnlockingPayment(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#191919]">
      <div className="border-b border-[#e7e7e7] bg-white">
        <div className="mx-auto flex h-[68px] w-full max-w-[1600px] items-center justify-between px-5 lg:px-10">
          <a href="/" className="text-2xl font-semibold tracking-[-0.05em]">
            moink
          </a>
          <nav className="hidden items-center gap-9 text-sm text-[#222] lg:flex">
            <a href="/guide" className="hover:text-[#d6a2ad]">가이드</a>
            <a href="/faq" className="hover:text-[#d6a2ad]">FAQ</a>
            <a href="/support" className="hover:text-[#d6a2ad]">고객센터</a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold sm:inline">내 작업</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#191919] text-sm font-semibold text-white">
              김
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#e7e7e7] bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-10">
          <div>
            <p className="text-[15px] font-semibold">모바일 청첩장 제작하기</p>
            <p className="mt-1 text-xs text-[#777]">입력한 내용은 오른쪽 미리보기에서 바로 확인할 수 있어요.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={scrollToPreview}
              className="rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-sm font-semibold text-[#191919]"
            >
              미리보기
            </button>
            <button
              type="button"
              onClick={saveDraftNow}
              className="rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-sm font-semibold text-[#191919]"
            >
              저장하기
            </button>
            <button
              type="button"
              onClick={saveToSupabase}
              disabled={isSaving || isProcessingPhoto}
              className="rounded-[10px] bg-[#191919] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessingPhoto ? "사진 처리 중" : isSaving ? "저장 중" : "링크 만들기"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] gap-0 lg:h-[calc(100vh-137px)] lg:grid-cols-[240px_minmax(0,760px)_minmax(420px,1fr)] lg:overflow-hidden">
        <nav className="hidden min-h-[calc(100vh-137px)] border-r border-[#e7e7e7] bg-white px-8 py-10 lg:block">
          <div className="sticky top-8 space-y-4">
            {EDITOR_TABS.map((tab) => {
              const isSelected = activeEditorTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveEditorTab(tab.key)}
                  className={`flex w-full items-center gap-4 rounded-[12px] px-4 py-3 text-left text-sm transition ${
                    isSelected ? "bg-[#191919] text-white" : "text-[#777] hover:bg-[#f4f4f4] hover:text-[#191919]"
                  }`}
                >
                  <span className={isSelected ? "text-white/70" : "text-[#aaa]"}>{tab.icon}</span>
                  <span className="font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <main
          ref={editorRef}
          className="min-w-0 space-y-5 px-5 py-8 lg:h-[calc(100vh-137px)] lg:overflow-y-auto lg:px-8"
        >
          <header className="rounded-[18px] border border-[#dedede] bg-white p-5">
            <p className="text-[13px] font-semibold text-[#191919]">
              모바일 초대장 제작 안내
            </p>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm leading-7 text-[#666]">
                  결혼식, 돌잔치, 가족 행사에 맞게 제작할 수 있어요. 필요한 항목만 켜고 입력하면 전체 청첩장에 반영됩니다.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {isPublicMakePage ? (
                <button
                  type="button"
                  onClick={resetDraft}
                  disabled={isSaving || isProcessingPhoto}
                  className="rounded-[10px] border border-[#dedede] bg-white px-4 py-2 text-xs font-semibold text-[#555] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  처음부터 새로 만들기
                </button>
              ) : null}
            </div>
            {isCustomerEditPage && canMarkPaid ? (
              <div className="mt-3 rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm leading-6 text-[#6f6258]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#332b24]">
                      {draft.payment.isPaid ? "결제 완료 상태" : "아직 워터마크 제작본 상태"}
                    </p>
                    <p className="text-xs text-[#7c6e62]">
                      결제 확인 후 버튼을 누르면 같은 보기 링크가 최종 링크가 됩니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={markAsPaidAndSave}
                    disabled={isSaving || draft.payment.isPaid}
                    className="rounded-full bg-[#b29467] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {draft.payment.isPaid ? "처리 완료" : "결제 완료 처리"}
                  </button>
                </div>
                {shareUrl ? (
                  <div className="mt-3 grid gap-2 rounded-md bg-[#fffaf3] p-3">
                    <span className="text-xs font-semibold text-[#b29467]">
                      {draft.payment.isPaid ? "최종 보기 링크" : "현재 보기 링크"}
                    </span>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all font-semibold text-[#2f2a25] underline underline-offset-4"
                    >
                      {shareUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(shareUrl, "링크 복사")}
                      className="justify-self-start rounded-full border border-[#d8c6ab] px-4 py-2 text-xs font-semibold text-[#806b4f]"
                    >
                      링크 복사
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {isCustomerEditPage && !canMarkPaid ? (
              <div className="mt-3 rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm leading-6 text-[#6f6258]">
                <div className="grid gap-3">
                  <div>
                    <p className="font-semibold text-[#332b24]">워터마크 제거</p>
                    <p className="text-xs text-[#7c6e62]">
                      스마트스토어 결제 후 주문번호를 입력하면 워터마크가 제거됩니다.
                    </p>
                  </div>
                  {draft.payment.isPaid ? (
                    <div className="rounded-lg border border-[#eadfcd] bg-[#fffaf3] p-3">
                      <p className="font-semibold text-[#332b24]">결제 확인 완료 상태예요.</p>
                      {shareUrl ? (
                        <div className="mt-2 grid gap-2">
                          <span className="text-xs font-semibold text-[#b29467]">
                            최종 보기 링크
                          </span>
                          <a
                            href={shareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all font-semibold text-[#2f2a25] underline underline-offset-4"
                          >
                            {shareUrl}
                          </a>
                          <button
                            type="button"
                            onClick={() => void copyToClipboard(shareUrl, "최종 링크 복사")}
                            className="justify-self-start rounded-full border border-[#d8c6ab] px-4 py-2 text-xs font-semibold text-[#806b4f]"
                          >
                            최종 링크 복사
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        type="text"
                        value={paymentOrderNumber}
                        onChange={(event) => setPaymentOrderNumber(event.target.value)}
                        placeholder="주문번호 입력"
                        className="rounded-lg border border-[#eadfcd] bg-white px-3 py-3 text-sm text-[#332b24] outline-none transition focus:border-[#b29467]"
                      />
                      <button
                        type="button"
                        onClick={unlockPaymentWithOrderNumber}
                        disabled={isUnlockingPayment}
                        className="rounded-lg bg-[#2f2a25] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUnlockingPayment ? "확인 중" : "워터마크 제거하기"}
                      </button>
                    </div>
                  )}
                  {paymentMessage ? (
                    <p className="rounded-lg bg-[#fffaf3] px-3 py-2 text-xs leading-5 text-[#806b4f]">
                      {paymentMessage}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {isPublicMakePage ? (
              <div className="mt-4 rounded-[14px] border border-[#dedede] bg-[#fafafa] px-4 py-3 text-sm leading-6 text-[#666]">
                지금 만드는 청첩장은 워터마크가 포함된 제작본입니다. 결제 확인 후
                워터마크가 제거된 최종 링크로 사용할 수 있어요.
              </div>
            ) : null}
            {saveMessage ? (
              <div className="mt-4 rounded-md border border-[#eadfcd] bg-white px-4 py-3 text-sm leading-6 text-[#806b4f]">
                <p>{saveMessage}</p>
                {isPublicMakePage && shareUrl ? (
                  <div className="mt-3 grid gap-3 rounded-md border border-[#eadfcd] bg-[#fffaf3] p-3">
                    <span className="text-xs font-semibold text-[#b29467]">
                      청첩장 공유 링크
                    </span>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all font-semibold text-[#2f2a25] underline underline-offset-4"
                    >
                      {shareUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(shareUrl, "공유 링크 복사")}
                      className="justify-self-start rounded-full bg-[#2f2a25] px-4 py-2 text-xs font-semibold text-white"
                    >
                      공유 링크 복사
                    </button>
                    <p className="text-xs leading-5 text-[#8a7a6a]">
                      하객에게 공유하는 링크입니다. 결제 확인 전에는 워터마크가 표시될 수 있어요.
                    </p>
                  </div>
                ) : null}
                {!isPublicMakePage && shareUrl ? (
                  <div className="mt-3 grid gap-2">
                    <span className="text-xs font-semibold text-[#b29467]">보기 링크</span>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all font-semibold text-[#2f2a25] underline underline-offset-4"
                    >
                      {shareUrl}
                    </a>
                  </div>
                ) : null}
                {editUrl ? (
                  <div className="mt-3 grid gap-2 rounded-md border border-[#eadfcd] bg-[#fffaf3] p-3">
                    <span className="text-xs font-semibold text-[#b29467]">
                      {isPublicMakePage ? "고객 수정 링크" : "고객 수정 링크"}
                    </span>
                    <span className="hidden">
                      고객용 편집 링크
                    </span>
                    <a
                      href={editUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all font-semibold text-[#2f2a25] underline underline-offset-4"
                    >
                      {editUrl}
                    </a>
                    {isPublicMakePage ? (
                      <button
                        type="button"
                        onClick={() => void copyToClipboard(editUrl, "고객 수정 링크 복사")}
                        className="justify-self-start rounded-full border border-[#d8c6ab] px-4 py-2 text-xs font-semibold text-[#806b4f]"
                      >
                        고객 수정 링크 복사
                      </button>
                    ) : null}
                    <p className="text-xs leading-5 text-[#8a7a6a]">
                      결제 확인을 위해 판매자에게 보내주시고, 이후 내용을 수정할 때도 이 링크를 사용해 주세요.
                      비밀코드가 포함되어 있으니 하객에게는 공유하지 마세요.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </header>

          <nav className="sticky top-0 z-20 -mx-1 overflow-x-auto border-y border-[#e7e7e7] bg-[#f6f6f6]/95 py-3 backdrop-blur lg:hidden">
            <div className="flex min-w-max gap-2 px-1">
              {EDITOR_TABS.map((tab) => {
                const isSelected = activeEditorTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveEditorTab(tab.key)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-[#191919] bg-white shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
                        : "border-[#dedede] bg-white hover:border-[#191919]"
                    }`}
                  >
                    <span className="block whitespace-nowrap text-sm font-semibold text-[#2F2A26]">
                      {tab.label}
                    </span>
                    <span className="mt-1 hidden text-xs leading-4 text-[#777] xl:block">
                      {tab.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <FormSection title="기본 정보" isVisible={activeEditorTab === "basic"}>
            <div className="rounded-[18px] border border-[#dedede] bg-white p-6">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#2F2A26]">처음 한 번만 입력하면 전체 청첩장에 반영돼요.</p>
                <p className="mt-1 text-xs leading-5 text-[#777]">
                  이름, 예식 정보, 부모님 정보는 여기에서 관리해요.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <Field
                    label="신랑 성"
                    required
                    value={draft.couple.groom.familyName}
                    onChange={(value) => updatePersonName("groom", value, draft.couple.groom.givenName)}
                  />
                  <Field
                    label="신랑 이름"
                    required
                    value={draft.couple.groom.givenName}
                    onChange={(value) => updatePersonName("groom", draft.couple.groom.familyName, value)}
                  />
                  <Field
                    label="신부 성"
                    required
                    value={draft.couple.bride.familyName}
                    onChange={(value) => updatePersonName("bride", value, draft.couple.bride.givenName)}
                  />
                  <Field
                    label="신부 이름"
                    required
                    value={draft.couple.bride.givenName}
                    onChange={(value) => updatePersonName("bride", draft.couple.bride.familyName, value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="예식 날짜" type="date" value={dateValue} onChange={updateDate} />
                  <Field label="예식 시간" type="time" value={draft.event.time} onChange={updateTime} />
                </div>
                <Field
                  label="예식장"
                  value={draft.event.venue}
                  onChange={(value) =>
                    update((current) => {
                      current.event.venue = value;
                      return current;
                    })
                  }
                />
                <Field
                  label="주소"
                  value={draft.event.address}
                  onChange={(value) =>
                    update((current) => {
                      current.event.address = value;
                      return current;
                    })
                  }
                />
              </div>
            </div>

            <details open className="rounded-[18px] border border-[#dedede] bg-white p-6">
              <summary className="cursor-pointer text-sm font-semibold text-[#2F2A26]">
                부모님 및 가족 표시 정보
              </summary>
              <div className="mt-5 grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-4">
                    <p className="text-sm font-semibold text-[#332b24]">신랑측</p>
                    <ParentNameFields
                      title="신랑 아버지"
                      familyName={draft.couple.groom.parents.fatherFamilyName}
                      givenName={draft.couple.groom.parents.fatherGivenName}
                      deceased={draft.couple.groom.parents.fatherDeceased}
                      onFamilyNameChange={(value) =>
                        updateParentName("groom", "father", value, draft.couple.groom.parents.fatherGivenName)
                      }
                      onGivenNameChange={(value) =>
                        updateParentName("groom", "father", draft.couple.groom.parents.fatherFamilyName, value)
                      }
                      onDeceasedChange={(checked) =>
                        update((current) => {
                          current.couple.groom.parents.fatherDeceased = checked;
                          return current;
                        })
                      }
                    />
                    <ParentNameFields
                      title="신랑 어머니"
                      familyName={draft.couple.groom.parents.motherFamilyName}
                      givenName={draft.couple.groom.parents.motherGivenName}
                      deceased={draft.couple.groom.parents.motherDeceased}
                      onFamilyNameChange={(value) =>
                        updateParentName("groom", "mother", value, draft.couple.groom.parents.motherGivenName)
                      }
                      onGivenNameChange={(value) =>
                        updateParentName("groom", "mother", draft.couple.groom.parents.motherFamilyName, value)
                      }
                      onDeceasedChange={(checked) =>
                        update((current) => {
                          current.couple.groom.parents.motherDeceased = checked;
                          return current;
                        })
                      }
                    />
                    <Field
                      label="신랑 관계명"
                      required
                      placeholder="예: 아들, 장남, 차남"
                      value={draft.couple.groom.parents.relation}
                      onChange={(value) =>
                        update((current) => {
                          current.couple.groom.parents.relation = value;
                          return current;
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-4">
                    <p className="text-sm font-semibold text-[#332b24]">신부측</p>
                    <ParentNameFields
                      title="신부 아버지"
                      familyName={draft.couple.bride.parents.fatherFamilyName}
                      givenName={draft.couple.bride.parents.fatherGivenName}
                      deceased={draft.couple.bride.parents.fatherDeceased}
                      onFamilyNameChange={(value) =>
                        updateParentName("bride", "father", value, draft.couple.bride.parents.fatherGivenName)
                      }
                      onGivenNameChange={(value) =>
                        updateParentName("bride", "father", draft.couple.bride.parents.fatherFamilyName, value)
                      }
                      onDeceasedChange={(checked) =>
                        update((current) => {
                          current.couple.bride.parents.fatherDeceased = checked;
                          return current;
                        })
                      }
                    />
                    <ParentNameFields
                      title="신부 어머니"
                      familyName={draft.couple.bride.parents.motherFamilyName}
                      givenName={draft.couple.bride.parents.motherGivenName}
                      deceased={draft.couple.bride.parents.motherDeceased}
                      onFamilyNameChange={(value) =>
                        updateParentName("bride", "mother", value, draft.couple.bride.parents.motherGivenName)
                      }
                      onGivenNameChange={(value) =>
                        updateParentName("bride", "mother", draft.couple.bride.parents.motherFamilyName, value)
                      }
                      onDeceasedChange={(checked) =>
                        update((current) => {
                          current.couple.bride.parents.motherDeceased = checked;
                          return current;
                        })
                      }
                    />
                    <Field
                      label="신부 관계명"
                      required
                      placeholder="예: 딸, 장녀, 차녀"
                      value={draft.couple.bride.parents.relation}
                      onChange={(value) =>
                        update((current) => {
                          current.couple.bride.parents.relation = value;
                          return current;
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 border-t border-[#e4d8cc] pt-4 sm:grid-cols-2">
                  <ToggleField
                    label="부모님 이름 표시"
                    checked={draft.familySettings.showParents}
                    onChange={(checked) =>
                      update((current) => {
                        current.familySettings.showParents = checked;
                        return current;
                      })
                    }
                  />
                  <div className="grid gap-2 text-sm text-[#5f5349] sm:col-span-2">
                    <span>고인 표시 방식</span>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        { label: "표시 안 함", value: "none" },
                        { label: "꽃 아이콘 표시", value: "flower" },
                        { label: "작은 텍스트 표시", value: "hanja" },
                      ].map((option) => {
                        const isSelected = draft.familySettings.deceasedMarker === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              update((current) => {
                                current.familySettings.deceasedMarker =
                                  option.value as WeddingData["familySettings"]["deceasedMarker"];
                                return current;
                              })
                            }
                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                              isSelected
                                ? "border-[#191919] bg-white text-[#191919]"
                                : "border-[#dedede] bg-white text-[#777]"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label className="grid gap-2 text-sm text-[#5f5349]">
                    <span>고인 표기 위치</span>
                    <select
                      value={draft.familySettings.deceasedFormat}
                      onChange={(event) =>
                        update((current) => {
                          current.familySettings.deceasedFormat =
                            event.target.value as WeddingData["familySettings"]["deceasedFormat"];
                          return current;
                        })
                      }
                      className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#e9a8ba]"
                    >
                      <option value="prefix">故 홍길동</option>
                      <option value="suffix">홍길동(故)</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm text-[#5f5349]">
                    <span>가족 정보 정렬</span>
                    <select
                      value={draft.familySettings.align}
                      onChange={(event) =>
                        update((current) => {
                          current.familySettings.align = event.target.value as WeddingData["familySettings"]["align"];
                          return current;
                        })
                      }
                      className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#e9a8ba]"
                    >
                      <option value="center">중앙 정렬</option>
                      <option value="left">왼쪽 정렬</option>
                    </select>
                  </label>
                </div>
              </div>
            </details>
          </FormSection>

          <FormSection title="음악" isVisible={activeEditorTab === "design"}>
            <div className="grid gap-3">
              {MUSIC_OPTIONS.map((music) => {
                const isSelected = (draft.music?.src ?? "") === (music?.src ?? "");

                return (
                  <div
                    key={music?.src ?? "none"}
                    className={`rounded-[14px] border p-4 transition ${
                      isSelected ? "border-[#191919] bg-white" : "border-[#dedede] bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          update((current) => {
                            current.music = music;
                            return current;
                          })
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          isSelected ? "bg-[#191919] text-white" : "border border-[#dedede] bg-white text-[#191919]"
                        }`}
                      >
                        {isSelected ? "선택됨" : "선택하기"}
                      </button>
                      <span className="text-sm font-semibold text-[#191919]">
                        {music?.title ?? "음악 없음"}
                      </span>
                    </div>
                    {music?.src ? (
                      <audio controls preload="none" className="mt-3 w-full">
                        <source src={music.src} type="audio/mpeg" />
                      </audio>
                    ) : (
                      <p className="mt-3 text-xs text-[#777]">배경음악 없이 깔끔하게 보여줘요.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </FormSection>

          <FormSection title="테마" isVisible={activeEditorTab === "design"}>
            <div className="rounded-[18px] border border-[#dedede] bg-white">
              <details open>
                <summary className="flex cursor-pointer list-none items-center justify-between border-b border-[#ededed] px-5 py-4 text-sm font-semibold text-[#191919]">
                  <span>테마</span>
                  <span className="text-lg leading-none">⌃</span>
                </summary>
                <div className="grid gap-4 px-5 py-5">
                  <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr] sm:items-center">
                    <span className="text-sm text-[#555]">글꼴</span>
                    <select
                      value={draft.hero.themeFont}
                      onChange={(event) =>
                        update((current) => {
                          current.hero.themeFont =
                            event.target.value as WeddingData["hero"]["themeFont"];
                          return current;
                        })
                      }
                      className="h-11 w-full rounded-[10px] border border-[#dedede] bg-white px-3 text-sm text-[#191919] outline-none focus:border-[#191919] sm:max-w-[16rem]"
                    >
                      {THEME_FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr] sm:items-center">
                    <span className="text-sm text-[#555]">오프닝 디자인</span>
                    <div className="grid gap-3 sm:grid-cols-[16rem_1fr] sm:items-center">
                      <select
                        value={draft.hero.coverTemplate}
                        onChange={(event) =>
                          update((current) => {
                            current.hero.coverTemplate =
                              event.target.value as WeddingData["hero"]["coverTemplate"];
                            if (current.hero.coverTemplate === "fullscreen") {
                              current.hero.fullscreenCalligraphyEnabled = true;
                              current.hero.fullscreenCalligraphyText =
                                current.hero.fullscreenCalligraphyText || selectedPhrase;
                            }
                            return current;
                          })
                        }
                        className="h-11 w-full rounded-[10px] border border-[#dedede] bg-white px-3 text-sm text-[#191919] outline-none focus:border-[#191919]"
                      >
                        {INTRO_TEMPLATE_OPTIONS.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs leading-5 text-[#777]">
                        {INTRO_TEMPLATE_OPTIONS.find((template) => template.id === draft.hero.coverTemplate)
                          ?.description ?? "웨딩 포스터형 오프닝 디자인"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr] sm:items-center">
                    <span className="text-sm text-[#555]">꽃가루 효과</span>
                    <div className="grid gap-3 sm:grid-cols-[16rem_1fr] sm:items-center">
                      <select
                        value={draft.hero.petalEffect}
                        onChange={(event) => {
                          update((current) => {
                            current.hero.petalEffect =
                              event.target.value as WeddingData["hero"]["petalEffect"];
                            return current;
                          });
                          setPreviewReplayKey((key) => key + 1);
                          window.setTimeout(scrollToPreview, 80);
                        }}
                        className="h-11 w-full rounded-[10px] border border-[#dedede] bg-white px-3 text-sm text-[#191919] outline-none focus:border-[#191919]"
                      >
                        {PETAL_EFFECT_OPTIONS.map((effect) => (
                          <option key={effect.value} value={effect.value}>
                            {effect.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div className="rounded-[18px] border border-[#dedede] bg-white p-6">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#191919]">오프닝 문구</p>
                <p className="mt-1 text-xs leading-5 text-[#777]">
                  첫 화면 포스터에 들어가는 문구예요. 템플릿마다 위치는 고정되고 문구만 바뀌어요.
                </p>
              </div>
              <div className="grid gap-4">
                <Field
                  label="메인 영문 문구"
                  description="사진 위나 이름 근처에 작게 들어가는 대표 영문 문구예요."
                  value={draft.hero.introEnglishMessage}
                  placeholder="We're getting married"
                  onChange={(value) =>
                    update((current) => {
                      current.hero.introEnglishMessage = value;
                      return current;
                    })
                  }
                />
                <Field
                  label="짧은 초대 문구"
                  description="사진 아래나 중앙 문장으로 들어가는 짧은 초대 문구예요."
                  value={draft.hero.introSubMessage}
                  placeholder="You are joyfully invited"
                  onChange={(value) =>
                    update((current) => {
                      current.hero.introSubMessage = value;
                      return current;
                    })
                  }
                />
                <Field
                  label="한글 안내 문구"
                  description="한글로 보여주는 감성 문구예요. 길면 자동으로 줄바꿈돼요."
                  value={draft.hero.introInvitationMessage}
                  placeholder="소중한 분들을 초대합니다"
                  onChange={(value) =>
                    update((current) => {
                      current.hero.introInvitationMessage = value;
                      return current;
                    })
                  }
                />
              </div>
            </div>

            {draft.hero.coverTemplate === "fullscreen" ? (
              <div className="rounded-[18px] border border-[#dedede] bg-white p-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-[#332b24]">
                    풀스크린 캘리그래피 문구
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#8a7a6a]">
                    풀스크린 사진형 첫 화면에만 올라가는 손글씨 문구예요.
                  </p>
                </div>
                <div className="grid gap-4">
                  <ToggleField
                    label="캘리그래피 문구 표시"
                    checked={draft.hero.fullscreenCalligraphyEnabled}
                    onChange={(checked) =>
                      update((current) => {
                        current.hero.fullscreenCalligraphyEnabled = checked;
                        return current;
                      })
                    }
                  />
                  <Field
                    label="캘리그래피 문구"
                    value={draft.hero.fullscreenCalligraphyText}
                    placeholder="Our Wedding Day"
                    onChange={(value) =>
                      update((current) => {
                        current.hero.fullscreenCalligraphyText = value;
                        return current;
                      })
                    }
                  />
                  <label className="grid min-w-0 gap-2 text-sm text-[#5f5349]">
                    <span>캘리그래피 글꼴</span>
                    <select
                      value={draft.hero.fullscreenCalligraphyFont}
                      onChange={(event) =>
                        update((current) => {
                          current.hero.fullscreenCalligraphyFont =
                            event.target.value as WeddingData["hero"]["fullscreenCalligraphyFont"];
                          return current;
                        })
                      }
                      className="w-full min-w-0 rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
                    >
                      {FULLSCREEN_CALLIGRAPHY_FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {weddingHandwritingPhrases.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() =>
                          update((current) => {
                            current.hero.fullscreenCalligraphyText = suggestion;
                            current.hero.fullscreenCalligraphyEnabled = true;
                            return current;
                          })
                        }
                        className="rounded-full border border-[#dfd2bf] bg-white px-3 py-2 text-xs font-medium text-[#806b4f]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <ColorField
                    label="캘리그래피 색상"
                    value={draft.hero.fullscreenCalligraphyColor}
                    onChange={(value) =>
                      update((current) => {
                        current.hero.fullscreenCalligraphyColor = value;
                        return current;
                      })
                    }
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <RangeField
                      label="위아래 위치"
                      value={draft.hero.fullscreenCalligraphyTop}
                      min={12}
                      max={82}
                      suffix="%"
                      onChange={(value) =>
                        update((current) => {
                          current.hero.fullscreenCalligraphyTop = value;
                          return current;
                        })
                      }
                    />
                    <RangeField
                      label="좌우 위치"
                      value={draft.hero.fullscreenCalligraphyLeft}
                      min={18}
                      max={82}
                      suffix="%"
                      onChange={(value) =>
                        update((current) => {
                          current.hero.fullscreenCalligraphyLeft = value;
                          return current;
                        })
                      }
                    />
                  </div>
                  <RangeField
                    label="글씨 크기"
                    value={draft.hero.fullscreenCalligraphySize}
                    min={28}
                    max={92}
                    suffix="px"
                    onChange={(value) =>
                      update((current) => {
                        current.hero.fullscreenCalligraphySize = value;
                        return current;
                      })
                    }
                  />
                </div>
              </div>
            ) : null}

            <div className="rounded-[18px] border border-[#dedede] bg-white p-6">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#332b24]">메인 사진</p>
                <p className="mt-1 text-xs leading-5 text-[#8a7a6a]">
                  세로형 웨딩 사진을 넣으면 첫 화면이 가장 자연스럽게 보여요.
                </p>
              </div>
              <div className="grid gap-4">
                <FileField label="메인 커버 사진 업로드" onSelect={updateCoverFile} />
                <Field
                  label="메인 커버 이미지 URL"
                  value={draft.photos.cover.src}
                  onChange={(value) =>
                    update((current) => {
                      current.photos.cover.src = value;
                      return current;
                    })
                  }
                />
              </div>
            </div>

            <div className="rounded-[18px] border border-[#dedede] bg-white p-6">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#332b24]">레터링</p>
                <p className="mt-1 text-xs leading-5 text-[#8a7a6a]">
                  사진 위에 올라가는 손글씨 느낌 문구를 설정해요.
                </p>
              </div>
              <div className="grid gap-4">
                <Field
                  label="레터링 문구"
                  value={draft.hero.letteringText}
                  placeholder={selectedPhrase}
                  onChange={(value) =>
                    update((current) => {
                      current.hero.letteringText = value;
                      return current;
                    })
                  }
                />
                <label className="grid gap-2 text-sm text-[#5f5349]">
                  <span>레터링 글꼴</span>
                  <select
                    value={draft.hero.letteringFont}
                    onChange={(event) =>
                      update((current) => {
                        current.hero.letteringFont = event.target.value as WeddingData["hero"]["letteringFont"];
                        return current;
                      })
                    }
                    className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
                  >
                    {LETTERING_FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  {weddingHandwritingPhrases.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        update((current) => {
                          current.hero.letteringText = suggestion;
                          return current;
                        })
                      }
                      className="rounded-full border border-[#dfd2bf] bg-white px-3 py-2 text-xs font-medium text-[#806b4f]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    label="레터링 색상"
                    value={draft.hero.letteringColor}
                    onChange={(value) =>
                      update((current) => {
                        current.hero.letteringColor = value;
                        return current;
                      })
                    }
                  />
                  <RangeField
                    label="레터링 위치"
                    value={draft.hero.letteringTop}
                    min={20}
                    max={72}
                    suffix="%"
                    onChange={(value) =>
                      update((current) => {
                        current.hero.letteringTop = value;
                        return current;
                      })
                    }
                  />
                </div>
                <RangeField
                  label="레터링 등장 속도"
                  value={draft.hero.letteringDuration}
                  min={0.4}
                  max={3}
                  step={0.05}
                  suffix="초"
                  onChange={(value) =>
                    update((current) => {
                      current.hero.letteringDuration = value;
                      return current;
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleField
                label="메인 하단 예식 정보 표시"
                checked={draft.hero.showEventInfo}
                onChange={(checked) =>
                  update((current) => {
                    current.hero.showEventInfo = checked;
                    return current;
                  })
                }
              />
              <ToggleField
                label="스크롤 안내 표시"
                checked={draft.hero.showScrollHint}
                onChange={(checked) =>
                  update((current) => {
                    current.hero.showScrollHint = checked;
                    return current;
                  })
                }
              />
            </div>
          </FormSection>

          <FormSection title="섹션 구성" isVisible={false}>
            <div className="grid gap-2">
              {SECTION_TOGGLE_OPTIONS.map((option) => {
                const isOpen = openSectionKey === option.key;

                return (
                  <div
                    key={option.key}
                    className="overflow-hidden rounded-[16px] border border-[#dedede] bg-white"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <label className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={draft.sections[option.key]}
                          onChange={(event) =>
                            update((current) => {
                              current.sections = {
                                ...wedding.sections,
                                ...current.sections,
                                [option.key]: event.target.checked,
                              };
                              return current;
                            })
                          }
                          className="peer sr-only"
                          aria-label={`${option.label} 표시 여부`}
                        />
                        <span className="absolute inset-0 rounded-full bg-[#cfcfcf] transition peer-checked:bg-[#191919]" />
                        <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition peer-checked:translate-x-6" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setOpenSectionKey(isOpen ? "openingMessage" : option.key)}
                        className="flex flex-1 items-center justify-between gap-4 py-1 text-left text-base font-medium text-[#332b24]"
                      >
                        <span>{option.label}</span>
                        <span className="text-2xl font-light leading-none text-[#2f2924]">
                          {isOpen ? "⌃" : "⌄"}
                        </span>
                      </button>
                    </div>
                    {isOpen ? (
                      <div className="border-t border-[#ededed] px-4 py-5">
                        {renderSectionEditor(option.key)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </FormSection>

          <FormSection title="문구" isVisible={activeEditorTab === "design"}>
            <TextArea
              label="초대 문구"
              value={draft.message.body}
              onChange={(value) =>
                update((current) => {
                  current.message.body = value;
                  return current;
                })
              }
            />
            <TextArea
              label="감사 문구"
              value={draft.message.footer}
              rows={2}
              onChange={(value) =>
                update((current) => {
                  current.message.footer = value;
                  return current;
                })
              }
            />
          </FormSection>

          <FormSection title="스토리 타입" isVisible={false}>
            <label className="grid gap-2 text-sm text-[#5f5349]">
              <span>청첩장 스타일</span>
              <select
                value={draft.storyStyle.type}
                onChange={(event) => updateStoryType(event.target.value as InvitationStoryType)}
                className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
              >
                <option value="default">기본형</option>
                <option value="qa">Q&A형</option>
                <option value="timeline">우리 이야기형</option>
              </select>
            </label>

            {draft.storyStyle.type === "qa" ? (
              <div className="grid gap-4">
                <label className="flex items-center gap-3 rounded-md bg-white px-3 py-3 text-sm text-[#5f5349]">
                  <input
                    type="checkbox"
                    checked={draft.storyStyle.qaEnabled}
                    onChange={(event) =>
                      update((current) => {
                        current.storyStyle.qaEnabled = event.target.checked;
                        return current;
                      })
                    }
                  />
                  Q&A 섹션 사용하기
                </label>
                {draft.qa.map((item, index) => (
                  <QAEditor
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(nextItem) => updateQA(index, nextItem)}
                    onRemove={() => removeQA(index)}
                  />
                ))}
                <button
                  type="button"
                  onClick={addQA}
                  className="rounded-full border border-[#d8c6ab] bg-white px-5 py-3 text-sm font-semibold text-[#806b4f]"
                >
                  질문 추가하기
                </button>
              </div>
            ) : null}

            {draft.storyStyle.type === "timeline" ? (
              <div className="grid gap-4">
                <label className="flex items-center gap-3 rounded-md bg-white px-3 py-3 text-sm text-[#5f5349]">
                  <input
                    type="checkbox"
                    checked={draft.storyStyle.timelineEnabled}
                    onChange={(event) =>
                      update((current) => {
                        current.storyStyle.timelineEnabled = event.target.checked;
                        return current;
                      })
                    }
                  />
                  우리 이야기 타임라인 사용하기
                </label>
                {draft.timeline.map((item, index) => (
                  <TimelineEditor
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(nextItem) => updateTimeline(index, nextItem)}
                    onRemove={() => removeTimeline(index)}
                  />
                ))}
                <button
                  type="button"
                  onClick={addTimeline}
                  className="rounded-full border border-[#d8c6ab] bg-white px-5 py-3 text-sm font-semibold text-[#806b4f]"
                >
                  스토리 카드 추가하기
                </button>
              </div>
            ) : null}
          </FormSection>

          <FormSection title="계좌·참석" isVisible={activeEditorTab === "accounts"}>
            <div className="grid gap-4">
              {draft.accounts.map((account, index) => (
                <AccountEditor
                  key={account.id}
                  account={account}
                  onChange={(nextAccount) => updateAccount(index, nextAccount)}
                  onRemove={() => removeAccount(index)}
                />
              ))}
              <button
                type="button"
                onClick={addAccount}
                className="rounded-full border border-[#d8c6ab] bg-white px-5 py-3 text-sm font-semibold text-[#806b4f]"
              >
                계좌 추가하기
              </button>
            </div>
            <div className="rounded-[18px] border border-[#dedede] bg-white p-6">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#2F2A26]">참석 여부 전달</p>
                <p className="mt-1 text-xs leading-5 text-[#777]">
                  하객이 남긴 참석 여부를 고객 편집 링크에서 확인할 수 있어요.
                </p>
              </div>
              {renderSectionEditor("rsvp")}
            </div>
          </FormSection>

          <FormSection title="사진" isVisible={activeEditorTab === "design"}>
            <div className="grid gap-5 rounded-[18px] border border-[#dedede] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#191919]">어릴 적 액자 & 프로필</p>
                  <p className="mt-1 text-xs leading-5 text-[#777]">
                    액자 속 어릴 적 사진과 MBTI, 별명, 해시태그를 한 묶음으로 보여줘요.
                  </p>
                </div>
                <label className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={draft.sections.profile}
                    onChange={(event) =>
                      update((current) => {
                        current.sections = {
                          ...wedding.sections,
                          ...current.sections,
                          profile: event.target.checked,
                        };
                        return current;
                      })
                    }
                    className="peer sr-only"
                    aria-label="어릴 적 액자와 프로필 표시 여부"
                  />
                  <span className="absolute inset-0 rounded-full bg-[#cfcfcf] transition peer-checked:bg-[#191919]" />
                  <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition peer-checked:translate-x-6" />
                </label>
              </div>

              {draft.sections.profile ? (
                <div className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-3 rounded-[14px] border border-[#ededed] bg-[#fafafa] p-4">
                      <p className="text-sm font-semibold text-[#191919]">신랑 어릴 적 사진</p>
                      <FileField
                        label="사진 첨부"
                        onSelect={(files) => updateChildPhotoFile("groom", files)}
                      />
                      <Field
                        label="사진 URL"
                        value={draft.photos.groomChildPhoto?.src ?? ""}
                        onChange={(value) =>
                          update((current) => {
                            current.photos.groomChildPhoto.src = value;
                            current.photos.groomChildPhoto.scale =
                              current.photos.groomChildPhoto.scale ?? 1;
                            return current;
                          })
                        }
                      />
                      <RangeField
                        label="사진 확대"
                        value={draft.photos.groomChildPhoto?.scale ?? 1}
                        min={1}
                        max={2.4}
                        step={0.05}
                        suffix="x"
                        onChange={(value) => updateChildPhotoScale("groom", value)}
                      />
                    </div>
                    <div className="grid gap-3 rounded-[14px] border border-[#ededed] bg-[#fafafa] p-4">
                      <p className="text-sm font-semibold text-[#191919]">신부 어릴 적 사진</p>
                      <FileField
                        label="사진 첨부"
                        onSelect={(files) => updateChildPhotoFile("bride", files)}
                      />
                      <Field
                        label="사진 URL"
                        value={draft.photos.brideChildPhoto?.src ?? ""}
                        onChange={(value) =>
                          update((current) => {
                            current.photos.brideChildPhoto.src = value;
                            current.photos.brideChildPhoto.scale =
                              current.photos.brideChildPhoto.scale ?? 1;
                            return current;
                          })
                        }
                      />
                      <RangeField
                        label="사진 확대"
                        value={draft.photos.brideChildPhoto?.scale ?? 1}
                        min={1}
                        max={2.4}
                        step={0.05}
                        suffix="x"
                        onChange={(value) => updateChildPhotoScale("bride", value)}
                      />
                    </div>
                  </div>
                  <div className="rounded-[14px] border border-[#ededed] bg-white p-4">
                    {renderSectionEditor("profile")}
                  </div>
                </div>
              ) : (
                <p className="rounded-[14px] bg-[#fafafa] px-4 py-3 text-xs leading-5 text-[#777]">
                  꺼두면 청첩장에 어릴 적 액자와 프로필 문구가 모두 표시되지 않아요.
                </p>
              )}
            </div>

            <div className="grid gap-4 rounded-lg border border-[#eadfcd] bg-white p-4">
              <p className="text-sm font-semibold text-[#332b24]">본문 사진</p>
              <FileField
                label="초대 문구 아래 사진 첨부"
                onSelect={(files) => updateSinglePhotoFile("intro", files, "초대 문구 아래 사진")}
              />
              <Field
                label="초대 문구 아래 사진 URL"
                value={draft.photos.intro.src}
                onChange={(value) =>
                  update((current) => {
                    current.photos.intro.src = value;
                    return current;
                  })
                }
              />
              <FileField
                label="예식 정보 전후 사진 첨부"
                onSelect={(files) => updateSinglePhotoFile("venue", files, "예식 정보 전후 사진")}
              />
              <Field
                label="예식 정보 전후 사진 URL"
                value={draft.photos.venue.src}
                onChange={(value) =>
                  update((current) => {
                    current.photos.venue.src = value;
                    return current;
                  })
                }
              />
            </div>
            <FileField label="갤러리 사진 첨부" onSelect={appendGalleryFiles} multiple />
            <p className="-mt-2 text-xs leading-5 text-[#8a7a6a]">
              새 사진을 첨부하면 기존 샘플 갤러리는 사라지고 첨부한 사진만 표시돼요.
            </p>
            <TextArea
              label="갤러리 이미지 URL 여러 개"
              value={galleryText}
              rows={7}
              onChange={updateGallery}
            />
            <p className="-mt-2 text-xs leading-5 text-[#8a7a6a]">
              파일로 첨부한 사진은 이 URL 칸에 표시되지 않아도 정상이에요.
            </p>
          </FormSection>

          <FormSection title="스토리 타입" isVisible={activeEditorTab === "design"}>
            <label className="grid gap-2 text-sm text-[#5f5349]">
              <span>청첩장 스타일</span>
              <select
                value={draft.storyStyle.type}
                onChange={(event) => updateStoryType(event.target.value as InvitationStoryType)}
                className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
              >
                <option value="default">기본형</option>
                <option value="qa">Q&A형</option>
                <option value="timeline">우리 이야기형</option>
              </select>
            </label>

            {draft.storyStyle.type === "qa" ? (
              <div className="grid gap-4">
                <label className="flex items-center gap-3 rounded-md bg-white px-3 py-3 text-sm text-[#5f5349]">
                  <input
                    type="checkbox"
                    checked={draft.storyStyle.qaEnabled}
                    onChange={(event) =>
                      update((current) => {
                        current.storyStyle.qaEnabled = event.target.checked;
                        return current;
                      })
                    }
                  />
                  Q&A 섹션 사용하기
                </label>
                {draft.qa.map((item, index) => (
                  <QAEditor
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(nextItem) => updateQA(index, nextItem)}
                    onRemove={() => removeQA(index)}
                  />
                ))}
                <button
                  type="button"
                  onClick={addQA}
                  className="rounded-full border border-[#d8c6ab] bg-white px-5 py-3 text-sm font-semibold text-[#806b4f]"
                >
                  질문 추가하기
                </button>
              </div>
            ) : null}

            {draft.storyStyle.type === "timeline" ? (
              <div className="grid gap-4">
                <label className="flex items-center gap-3 rounded-md bg-white px-3 py-3 text-sm text-[#5f5349]">
                  <input
                    type="checkbox"
                    checked={draft.storyStyle.timelineEnabled}
                    onChange={(event) =>
                      update((current) => {
                        current.storyStyle.timelineEnabled = event.target.checked;
                        return current;
                      })
                    }
                  />
                  우리 이야기 타임라인 사용하기
                </label>
                {draft.timeline.map((item, index) => (
                  <TimelineEditor
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(nextItem) => updateTimeline(index, nextItem)}
                    onRemove={() => removeTimeline(index)}
                  />
                ))}
                <button
                  type="button"
                  onClick={addTimeline}
                  className="rounded-full border border-[#d8c6ab] bg-white px-5 py-3 text-sm font-semibold text-[#806b4f]"
                >
                  스토리 카드 추가하기
                </button>
              </div>
            ) : null}
          </FormSection>

          <FormSection title="섹션 구성" isVisible={activeEditorTab === "design"}>
            <div className="grid gap-2">
              {SECTION_TOGGLE_OPTIONS.map((option) => {
                const isOpen = openSectionKey === option.key;

                return (
                  <div
                    key={option.key}
                    className="overflow-hidden rounded-[16px] border border-[#dedede] bg-white"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <label className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={draft.sections[option.key]}
                          onChange={(event) =>
                            update((current) => {
                              current.sections = {
                                ...wedding.sections,
                                ...current.sections,
                                [option.key]: event.target.checked,
                              };
                              return current;
                            })
                          }
                          className="peer sr-only"
                          aria-label={`${option.label} 표시 여부`}
                        />
                        <span className="absolute inset-0 rounded-full bg-[#cfcfcf] transition peer-checked:bg-[#191919]" />
                        <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition peer-checked:translate-x-6" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setOpenSectionKey(isOpen ? "openingMessage" : option.key)}
                        className="flex flex-1 items-center justify-between gap-4 py-1 text-left text-base font-medium text-[#332b24]"
                      >
                        <span>{option.label}</span>
                        <span className="text-2xl font-light leading-none text-[#2f2924]">
                          {isOpen ? "⌃" : "⌄"}
                        </span>
                      </button>
                    </div>
                    {isOpen ? (
                      <div className="border-t border-[#ededed] px-4 py-5">
                        {renderSectionEditor(option.key)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </FormSection>

          <FormSection title="음악" isVisible={false}>
            <div className="grid gap-3">
              {MUSIC_OPTIONS.map((music) => {
                const isSelected = (draft.music?.src ?? "") === (music?.src ?? "");

                return (
                  <div
                    key={music?.src ?? "none"}
                    className={`rounded-[14px] border p-4 transition ${
                      isSelected ? "border-[#191919] bg-white" : "border-[#dedede] bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          update((current) => {
                            current.music = music;
                            return current;
                          })
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          isSelected ? "bg-[#191919] text-white" : "border border-[#dedede] bg-white text-[#191919]"
                        }`}
                      >
                        {isSelected ? "선택됨" : "선택하기"}
                      </button>
                      <span className="text-sm font-semibold text-[#191919]">
                        {music?.title ?? "음악 없음"}
                      </span>
                    </div>
                    {music?.src ? (
                      <audio controls preload="none" className="mt-3 w-full">
                        <source src={music.src} type="audio/mpeg" />
                      </audio>
                    ) : (
                      <p className="mt-3 text-xs text-[#777]">배경음악 없이 깔끔하게 보여줘요.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </FormSection>

          <FormSection title="공유 설정" isVisible={activeEditorTab === "share"}>
            <Field
              label="지도 링크"
              value={draft.event.mapUrl}
              onChange={(value) =>
                update((current) => {
                  current.event.mapUrl = value;
                  return current;
                })
              }
            />
          </FormSection>
        </main>

        <aside
          ref={previewRef}
          className="min-w-0 scroll-mt-6 bg-[#444] px-5 py-8 lg:h-[calc(100vh-137px)] lg:px-10"
        >
          <div className="mb-6 flex items-center justify-between gap-3 px-1 text-sm text-white/72">
            <span>모바일 청첩장 미리보기</span>
            <button
              type="button"
              onClick={scrollToEditor}
              className="shrink-0 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold text-white backdrop-blur"
            >
              편집으로 이동
            </button>
          </div>
          <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-[34px] bg-[#eee7e2] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[24px] bg-white">
              <WeddingInvitation data={preview} key={`${preview.hero.petalEffect}-${previewReplayKey}`} />
            </div>
          </div>
        </aside>
      </div>
      {toastMessage ? (
        <div className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-[#2f2a25] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(47,42,37,0.24)]">
          {toastMessage}
        </div>
      ) : null}
      {manualCopyText ? (
        <div className="fixed inset-x-4 bottom-20 z-[80] mx-auto max-w-[30rem] rounded-2xl border border-[#eadfcd] bg-white p-4 text-sm shadow-[0_18px_44px_rgba(47,42,37,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[#332b24]">직접 복사하기</p>
              <p className="mt-1 text-xs leading-5 text-[#806b4f]">
                아래 링크 칸을 누르면 전체 선택돼요. 선택된 상태에서 복사해 주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setManualCopyText("")}
              className="rounded-full border border-[#eadfcd] px-3 py-1 text-xs font-semibold text-[#806b4f]"
            >
              닫기
            </button>
          </div>
          <input
            readOnly
            value={manualCopyText}
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
            className="mt-3 w-full rounded-lg border border-[#d8c6ab] bg-[#fffaf3] px-3 py-3 text-sm font-semibold text-[#2f2a25] outline-none"
          />
        </div>
      ) : null}
      <div className="fixed bottom-5 right-4 z-[70] flex flex-col gap-2 lg:hidden">
        <button
          type="button"
          onClick={scrollToPreview}
          className="rounded-full bg-[#2f2a25] px-4 py-3 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(47,42,37,0.22)]"
        >
          미리보기
        </button>
        <button
          type="button"
          onClick={scrollToEditor}
          className="rounded-full border border-[#d8c6ab] bg-white px-4 py-3 text-xs font-semibold text-[#806b4f] shadow-[0_12px_30px_rgba(47,42,37,0.12)]"
        >
          편집
        </button>
      </div>
    </div>
  );
}

const PUBLIC_MAKE_STORAGE_KEY = `${EDITOR_STORAGE_KEY}-make-v4`;
