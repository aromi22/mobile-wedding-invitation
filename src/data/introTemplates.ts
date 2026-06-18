import type { WeddingCoverTemplate } from "@/types/wedding";

export const INTRO_TEMPLATE_OPTIONS: Array<{
  id: WeddingCoverTemplate;
  name: string;
  description: string;
  editableFields: string[];
  photo: "cover";
}> = [
  {
    id: "classic-poster",
    name: "01 Classic Poster",
    description: "정석적인 웨딩 포스터 느낌",
    editableFields: ["groomName", "brideName", "date", "time", "venue", "englishMessage", "photo"],
    photo: "cover",
  },
  {
    id: "editorial-marriage",
    name: "02 Editorial Marriage",
    description: "잡지 화보 같은 클래식 초대장",
    editableFields: ["groomName", "brideName", "date", "venue", "englishMessage", "photo"],
    photo: "cover",
  },
  {
    id: "minimal-date",
    name: "03 Minimal Date",
    description: "여백이 많은 미니멀 포스터",
    editableFields: ["groomNameEn", "brideNameEn", "date", "time", "venue", "photo"],
    photo: "cover",
  },
  {
    id: "soft-card",
    name: "04 Soft Card",
    description: "부드러운 화이트 카드 커버",
    editableFields: ["groomName", "brideName", "subMessage", "date", "venue", "photo"],
    photo: "cover",
  },
  {
    id: "framed-gallery",
    name: "05 Framed Gallery",
    description: "전시 포스터 같은 액자형 커버",
    editableFields: ["groomName", "brideName", "date", "venue", "subMessage", "photo"],
    photo: "cover",
  },
  {
    id: "modern-script",
    name: "06 Modern Script",
    description: "모던한 웨딩 포스터 무드",
    editableFields: ["groomNameEn", "brideNameEn", "date", "time", "venue", "englishMessage", "photo"],
    photo: "cover",
  },
];
