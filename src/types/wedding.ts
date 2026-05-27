export type PhotoRatio = "portrait" | "landscape";

export type WeddingPerson = {
  role: string;
  name: string;
  familyName: string;
  givenName: string;
  englishName: string;
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

export type WeddingFamilySettings = {
  align: "center" | "left";
  showParents: boolean;
  deceasedFormat: "prefix" | "suffix";
  deceasedMarker: "hanja" | "flower" | "lineart";
  coupleNameSeparator: "dot" | "heart";
};

export type WeddingHeroSettings = {
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
    gallery: WeddingPhoto[];
  };
  hero: WeddingHeroSettings;
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
  rsvp: {
    label: string;
    url: string;
  };
};
