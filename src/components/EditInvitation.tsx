"use client";

import { useEffect, useMemo, useState } from "react";
import { wedding } from "@/data/wedding";
import type {
  InvitationStoryType,
  PhotoRatio,
  WeddingAccount,
  WeddingData,
  WeddingMusic,
  WeddingQuestionAnswer,
  WeddingTimelineItem,
} from "@/types/wedding";
import { WeddingInvitation } from "@/components/WeddingInvitation";
import { saveInvitation } from "@/lib/invitations";

const STORAGE_KEY = "mobile-wedding-editor-v1";

const MUSIC_OPTIONS: Array<WeddingMusic | null> = [
  null,
  { title: "샘플 음악 1", src: "/music/sample-1.wav" },
  { title: "샘플 음악 2", src: "/music/sample-2.wav" },
];

const LETTERING_SUGGESTIONS = [
  "Our wedding day",
  "We're getting married",
  "The beginning of us",
  "Forever starts here",
];

const LETTERING_FONT_OPTIONS = [
  { label: "Segoe Print", value: "segoe-print" },
  { label: "Freestyle Script", value: "freestyle-script" },
] as const;

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
    gallery: source.photos?.gallery?.length ? source.photos.gallery : merged.photos.gallery,
  };
  merged.hero = {
    ...merged.hero,
    ...source.hero,
    mainText: source.hero?.mainText ?? source.message?.coverLine ?? merged.hero.mainText,
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
  merged.rsvp = { ...merged.rsvp, ...source.rsvp };
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-[#5f5349]">
      <span>
        {label}
        {required ? <span className="ml-1 text-[#b29467]">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
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
    <label className="grid gap-2 text-sm text-[#5f5349]">
      <span>{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="resize-y rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base leading-7 text-[#332b24] outline-none transition focus:border-[#b29467]"
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
    <label className="grid gap-2 text-sm text-[#5f5349]">
      <span>{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-[#e5dacb] bg-white px-3 py-2">
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
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-[#332b24] outline-none"
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
    <label className="grid gap-2 text-sm text-[#5f5349]">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <strong className="rounded-full bg-[#f2eadf] px-2.5 py-1 text-xs font-medium text-[#806b4f]">
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
        className="h-2 accent-[#b29467]"
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
    <label className="flex items-center justify-between gap-4 rounded-md border border-[#eadfcd] bg-white px-4 py-3 text-sm text-[#5f5349]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#b29467]"
      />
    </label>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#eadfcd] py-7">
      <h2 className="mb-5 text-lg font-semibold text-[#332b24]">{title}</h2>
      <div className="grid gap-4">{children}</div>
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

export function EditInvitation() {
  const [draft, setDraft] = useState<WeddingData>(wedding);
  const [dateValue, setDateValue] = useState(getDateInputValue(wedding));
  const [galleryText, setGalleryText] = useState(
    wedding.photos.gallery.map((photo) => photo.src).join("\n"),
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = normalizeWeddingData(JSON.parse(saved) as Partial<WeddingData>);
        setDraft(parsed);
        setDateValue(getDateInputValue(parsed));
        setGalleryText(parsed.photos.gallery.map((photo) => photo.src).join("\n"));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, isLoaded]);

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
        .filter(Boolean);

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

    const dataUrl = await fileToDataUrl(file);
    update((current) => {
      current.photos.cover.src = dataUrl;
      current.photos.cover.alt = file.name;
      return current;
    });
  }

  async function appendGalleryFiles(files: FileList) {
    const selectedFiles = Array.from(files);
    const dataUrls = await Promise.all(selectedFiles.map((file) => fileToDataUrl(file)));

    update((current) => {
      const newPhotos = dataUrls.map((src, index) => ({
        src,
        alt: selectedFiles[index].name,
        ratio: "portrait" as const,
      }));
      current.photos.gallery = [...current.photos.gallery, ...newPhotos];
      setGalleryText(current.photos.gallery.map((photo) => photo.src).join("\n"));
      return current;
    });
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

  function resetDraft() {
    setDraft(wedding);
    setDateValue(getDateInputValue(wedding));
    setGalleryText(wedding.photos.gallery.map((photo) => photo.src).join("\n"));
    setSaveMessage("");
    setShareUrl("");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  async function saveToSupabase() {
    setIsSaving(true);
    setSaveMessage("청첩장을 저장하고 있어요.");

    try {
      const saved = await saveInvitation(draft);
      const nextData = saved.design_settings;

      setDraft(nextData);
      setGalleryText(nextData.photos.gallery.map((photo) => photo.src).join("\n"));
      setShareUrl(`${window.location.origin}/w/${saved.slug}`);
      setSaveMessage("저장 완료! 아래 공유 링크가 생성됐어요.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "저장 중 문제가 생겼어요. Supabase 설정을 확인해주세요.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f0e8]">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_470px] lg:items-start">
        <div className="rounded-lg bg-[#fffdf8] px-5 shadow-[0_18px_50px_rgba(91,70,42,0.12)]">
          <header className="sticky top-0 z-10 -mx-5 border-b border-[#eadfcd] bg-[#fffdf8]/95 px-5 py-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-[#b29467]">Invitation Editor</p>
            <button
              type="button"
              onClick={saveToSupabase}
              disabled={isSaving}
              className="mt-4 rounded-full bg-[#2f2a25] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "저장 중" : "Supabase에 저장"}
            </button>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold text-[#332b24]">모바일 청첩장 편집</h1>
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-full border border-[#d8c6ab] px-4 py-2 text-sm text-[#806b4f]"
              >
                기본값으로 되돌리기
              </button>
            </div>
            {saveMessage ? (
              <div className="mt-4 rounded-md border border-[#eadfcd] bg-white px-4 py-3 text-sm leading-6 text-[#806b4f]">
                <p>{saveMessage}</p>
                {shareUrl ? (
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all font-semibold text-[#2f2a25] underline underline-offset-4"
                  >
                    {shareUrl}
                  </a>
                ) : null}
              </div>
            ) : null}
          </header>

          <FormSection title="1. 메인 화면 설정">
            <div className="rounded-xl border border-[#eadfcd] bg-white/72 p-4 shadow-[0_12px_30px_rgba(91,70,42,0.06)]">
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

            <div className="rounded-xl border border-[#eadfcd] bg-white/72 p-4 shadow-[0_12px_30px_rgba(91,70,42,0.06)]">
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
                  placeholder="Our wedding day"
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
                  {LETTERING_SUGGESTIONS.map((suggestion) => (
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

            <div className="rounded-xl border border-[#eadfcd] bg-white/72 p-4 shadow-[0_12px_30px_rgba(91,70,42,0.06)]">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#332b24]">메인 텍스트</p>
                <p className="mt-1 text-xs leading-5 text-[#8a7a6a]">
                  첫 화면 아래쪽에 보이는 짧은 소개 문구예요.
                </p>
              </div>
              <div className="grid gap-4">
                <TextArea
                  label="메인 텍스트"
                  value={draft.hero.mainText}
                  rows={2}
                  onChange={(value) =>
                    update((current) => {
                      current.hero.mainText = value;
                      current.message.coverLine = value;
                      return current;
                    })
                  }
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    label="메인 텍스트 색상"
                    value={draft.hero.mainTextColor}
                    onChange={(value) =>
                      update((current) => {
                        current.hero.mainTextColor = value;
                        return current;
                      })
                    }
                  />
                  <RangeField
                    label="메인 텍스트 위치"
                    value={draft.hero.mainTextTop}
                    min={55}
                    max={92}
                    suffix="%"
                    onChange={(value) =>
                      update((current) => {
                        current.hero.mainTextTop = value;
                        return current;
                      })
                    }
                  />
                </div>
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

          <FormSection title="2. 기본 정보">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="신랑 이름"
                value={draft.couple.groom.name}
                onChange={(value) =>
                  update((current) => {
                    const next = splitName(value);
                    current.couple.groom.familyName = next.familyName;
                    current.couple.groom.givenName = next.givenName;
                    current.couple.groom.name = value;
                    current.couple.groom.account.holder = value;
                    return current;
                  })
                }
              />
              <Field
                label="신부 이름"
                value={draft.couple.bride.name}
                onChange={(value) =>
                  update((current) => {
                    const next = splitName(value);
                    current.couple.bride.familyName = next.familyName;
                    current.couple.bride.givenName = next.givenName;
                    current.couple.bride.name = value;
                    current.couple.bride.account.holder = value;
                    return current;
                  })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="예식 날짜" type="date" value={dateValue} onChange={updateDate} />
              <Field label="예식 시간" value={draft.event.time} onChange={updateTime} />
            </div>
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
          </FormSection>

          <FormSection title="3. 문구 입력">
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

          <FormSection title="4. 스토리 타입 선택">
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

          <FormSection title="5. 가족 정보">
            <details open className="rounded-xl border border-[#eadfcd] bg-white/72 p-4 shadow-[0_12px_30px_rgba(91,70,42,0.06)]">
              <summary className="cursor-pointer text-sm font-semibold text-[#332b24]">
                신랑 정보
              </summary>
              <div className="mt-5 grid gap-4">
                <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
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
                </div>
                <div className="rounded-md bg-[#f8f2ea] px-4 py-3 text-sm text-[#806b4f]">
                  미리보기 이름: {draft.couple.groom.name || "신랑 이름"}
                </div>
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
                <Field
                  label="신랑 연락처"
                  value={draft.couple.groom.phone}
                  onChange={(value) =>
                    update((current) => {
                      current.couple.groom.phone = value;
                      return current;
                    })
                  }
                />
              </div>
            </details>

            <details open className="rounded-xl border border-[#eadfcd] bg-white/72 p-4 shadow-[0_12px_30px_rgba(91,70,42,0.06)]">
              <summary className="cursor-pointer text-sm font-semibold text-[#332b24]">
                신부 정보
              </summary>
              <div className="mt-5 grid gap-4">
                <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
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
                <div className="rounded-md bg-[#f8f2ea] px-4 py-3 text-sm text-[#806b4f]">
                  미리보기 이름: {draft.couple.bride.name || "신부 이름"}
                </div>
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
                <Field
                  label="신부 연락처"
                  value={draft.couple.bride.phone}
                  onChange={(value) =>
                    update((current) => {
                      current.couple.bride.phone = value;
                      return current;
                    })
                  }
                />
              </div>
            </details>

            <details open className="rounded-xl border border-[#eadfcd] bg-white/72 p-4 shadow-[0_12px_30px_rgba(91,70,42,0.06)]">
              <summary className="cursor-pointer text-sm font-semibold text-[#332b24]">
                표시 옵션
              </summary>
              <div className="mt-5 grid gap-4">
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
                    className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
                  >
                    <option value="center">중앙 정렬</option>
                    <option value="left">왼쪽 정렬</option>
                  </select>
                </label>
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
                <label className="grid gap-2 text-sm text-[#5f5349]">
                  <span>고인 표시 방식</span>
                  <select
                    value={draft.familySettings.deceasedFormat}
                    onChange={(event) =>
                      update((current) => {
                        current.familySettings.deceasedFormat =
                          event.target.value as WeddingData["familySettings"]["deceasedFormat"];
                        return current;
                      })
                    }
                    className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
                  >
                    <option value="prefix">故 홍길동</option>
                    <option value="suffix">홍길동(故)</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-[#5f5349]">
                  <span>고인 표식 선택</span>
                  <select
                    value={draft.familySettings.deceasedMarker}
                    onChange={(event) =>
                      update((current) => {
                        current.familySettings.deceasedMarker =
                          event.target.value as WeddingData["familySettings"]["deceasedMarker"];
                        return current;
                      })
                    }
                    className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
                  >
                    <option value="hanja">한자 故</option>
                    <option value="flower">국화꽃 이미지</option>
                    <option value="lineart">국화꽃 블랙 라인아트</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-[#5f5349]">
                  <span>신랑신부 이름 표시 방식</span>
                  <select
                    value={draft.familySettings.coupleNameSeparator}
                    onChange={(event) =>
                      update((current) => {
                        current.familySettings.coupleNameSeparator =
                          event.target.value as WeddingData["familySettings"]["coupleNameSeparator"];
                        return current;
                      })
                    }
                    className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
                  >
                    <option value="dot">김민우 · 이수연</option>
                    <option value="heart">김민우 ♥ 이수연</option>
                  </select>
                </label>
              </div>
            </details>
          </FormSection>

          <FormSection title="6. 계좌 정보">
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
          </FormSection>

          <FormSection title="7. 이미지 설정">
            <FileField label="갤러리 사진 첨부" onSelect={appendGalleryFiles} multiple />
            <TextArea
              label="갤러리 이미지 URL 여러 개"
              value={galleryText}
              rows={7}
              onChange={updateGallery}
            />
          </FormSection>

          <FormSection title="8. 음악 설정">
            <label className="grid gap-2 text-sm text-[#5f5349]">
              <span>배경음악 선택</span>
              <select
                value={draft.music?.src ?? ""}
                onChange={(event) => {
                  const nextMusic =
                    MUSIC_OPTIONS.find((music) => (music?.src ?? "") === event.target.value) ??
                    null;
                  update((current) => {
                    current.music = nextMusic;
                    return current;
                  });
                }}
                className="rounded-md border border-[#e5dacb] bg-white px-3 py-3 text-base text-[#332b24] outline-none transition focus:border-[#b29467]"
              >
                {MUSIC_OPTIONS.map((music) => (
                  <option key={music?.src ?? "none"} value={music?.src ?? ""}>
                    {music?.title ?? "음악 없음"}
                  </option>
                ))}
              </select>
            </label>
          </FormSection>

          <FormSection title="9. 링크 설정">
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
            <Field
              label="참석 여부 링크"
              value={draft.rsvp.url}
              onChange={(value) =>
                update((current) => {
                  current.rsvp.url = value;
                  return current;
                })
              }
            />
          </FormSection>
        </div>

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
    </div>
  );
}
