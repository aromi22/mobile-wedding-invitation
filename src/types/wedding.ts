export type PhotoRatio = "portrait" | "landscape";

export type WeddingPerson = {
  role: string;
  name: string;
  familyName: string;
  givenName: string;
  englishName: string;
  profile: {
    birthYear: string;
    hometown: string;
    mbti: string;
    intro: string;
    relationship: string;
    tags: string[];
  };
  parents: {
    father: string;
    fatherFamilyName: string;
    fatherGivenName: string;
    fatherDeceased: boolean;
    mother: string;
    motherFamilyName: string;
    motherGivenName: string;
    motherDeceased: boolean;
    relation: string;
  };
  phone: string;
  account: {
    bank: string;
    number: string;
    holder: string;
  };
};

export type WeddingPhoto = {
  src: string;
  alt: string;
  ratio: PhotoRatio;
  scale?: number;
};

export type WeddingStory = {
  title: string;
  body: string;
  image: string;
  ratio: PhotoRatio;
};

export type WeddingMusic = {
  title: string;
  src: string;
};

export type WeddingAccount = {
  id: string;
  side: "groom" | "bride" | "etc";
  label: string;
  bank: string;
  number: string;
  holder: string;
  kakaoPayUrl?: string;
};

export type InvitationStoryType = "default" | "qa" | "timeline";

export type WeddingQuestionAnswer = {
  id: string;
  question: string;
  answer: string;
};

export type WeddingTimelineItem = {
  id: string;
  title: string;
  date: string;
  body: string;
};

export type WeddingLetteringFont = "segoe-print" | "freestyle-script";
export type WeddingCoverTemplate =
  | "polaroid"
  | "fullscreen"
  | "clean"
  | "classic-poster"
  | "editorial-marriage"
  | "minimal-date"
  | "soft-card"
  | "framed-gallery"
  | "modern-script";
export type WeddingThemeFont =
  | "pretendard"
  | "sunbatang"
  | "nanumsquare"
  | "gangwon"
  | "cafe24-dongdong"
  | "jua"
  | "himelody"
  | "cafe24-ssukssuk";
export type WeddingPetalEffect =
  | "none"
  | "soft"
  | "pink"
  | "sky"
  | "snow"
  | "cherry"
  | "daisy"
  | "fall"
  | "heart";
export type WeddingCalligraphyFont =
  | "great-vibes"
  | "cormorant"
  | "caveat"
  | "freestyle-script";

export type WeddingFamilySettings = {
  align: "center" | "left";
  showParents: boolean;
  deceasedFormat: "prefix" | "suffix";
  deceasedMarker: "none" | "hanja" | "flower" | "lineart";
  coupleNameSeparator: "dot" | "heart";
};

export type WeddingHeroSettings = {
  themeFont: WeddingThemeFont;
  coverTemplate: WeddingCoverTemplate;
  petalEffect: WeddingPetalEffect;
  fullscreenCalligraphyEnabled: boolean;
  fullscreenCalligraphyText: string;
  fullscreenCalligraphyFont: WeddingCalligraphyFont;
  fullscreenCalligraphyColor: string;
  fullscreenCalligraphyTop: number;
  fullscreenCalligraphyLeft: number;
  fullscreenCalligraphySize: number;
  introEnglishMessage: string;
  introSubMessage: string;
  introInvitationMessage: string;
  letteringText: string;
  letteringFont: WeddingLetteringFont;
  letteringColor: string;
  letteringTop: number;
  letteringDuration: number;
  mainText: string;
  mainTextColor: string;
  mainTextTop: number;
  showEventInfo: boolean;
  showScrollHint: boolean;
};

export type WeddingSectionSettings = {
  openingMessage: boolean;
  story: boolean;
  qa: boolean;
  timeline: boolean;
  family: boolean;
  profile: boolean;
  calendar: boolean;
  location: boolean;
  gallery: boolean;
  accounts: boolean;
  rsvp: boolean;
  share: boolean;
  footer: boolean;
};

export type WeddingPaymentSettings = {
  isPaid: boolean;
  watermarkText: string;
};

export type WeddingRsvpFieldKey =
  | "category"
  | "attendance"
  | "meal"
  | "shuttle"
  | "name"
  | "phone"
  | "companionName"
  | "companionPhone"
  | "privacy"
  | "allEvents";

export type WeddingRsvpSettings = {
  label: string;
  url: string;
  title: string;
  guide: string;
  usePopup: boolean;
  popupMode: "none" | "before" | "after";
  fields: Record<WeddingRsvpFieldKey, boolean>;
  recipientEmail: string;
  recipientPhone: string;
};

export type WeddingRsvpResponse = {
  id: string;
  createdAt: string;
  category?: string;
  attendance?: string;
  meal?: string;
  shuttle?: string;
  name?: string;
  phone?: string;
  companionName?: string;
  companionPhone?: string;
  allEvents?: string;
};

export type WeddingData = {
  couple: {
    groom: WeddingPerson;
    bride: WeddingPerson;
  };
  event: {
    year: number;
    month: number;
    day: number;
    weekday: string;
    time: string;
    dateText: string;
    calendarText: string;
    venue: string;
    address: string;
    mapUrl: string;
  };
  message: {
    coverLine: string;
    opening: string;
    body: string;
    footer: string;
  };
  photos: {
    cover: WeddingPhoto;
    intro: WeddingPhoto;
    venue: WeddingPhoto;
    childhoodIllustration: WeddingPhoto;
    groomChildPhoto: WeddingPhoto;
    brideChildPhoto: WeddingPhoto;
    gallery: WeddingPhoto[];
  };
  hero: WeddingHeroSettings;
  sections: WeddingSectionSettings;
  payment: WeddingPaymentSettings;
  stories: WeddingStory[];
  storyStyle: {
    type: InvitationStoryType;
    qaEnabled: boolean;
    timelineEnabled: boolean;
  };
  familySettings: WeddingFamilySettings;
  qa: WeddingQuestionAnswer[];
  timeline: WeddingTimelineItem[];
  accounts: WeddingAccount[];
  music: WeddingMusic | null;
  rsvp: WeddingRsvpSettings;
};
