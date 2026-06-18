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
    description: "사진 중심의 정석 웨딩 포스터",
    editableFields: ["groomName", "brideName", "date", "time", "venue", "englishMessage", "photo"],
    photo: "cover",
  },
  {
    id: "editorial-marriage",
    name: "02 Editorial Marriage",
    description: "화보형 초대장 포스터",
    editableFields: ["groomName", "brideName", "date", "venue", "englishMessage", "photo"],
    photo: "cover",
  },
  {
    id: "minimal-date",
    name: "03 Minimal Date",
    description: "날짜와 사진이 돋보이는 미니멀 타입",
    editableFields: ["groomNameEn", "brideNameEn", "date", "time", "venue", "photo"],
    photo: "cover",
  },
  {
    id: "fullscreen",
    name: "04 Fullscreen Photo",
    description: "사진이 화면 가득 시작하는 타입",
    editableFields: ["groomName", "brideName", "date", "venue", "photo"],
    photo: "cover",
  },
  {
    id: "polaroid",
    name: "05 Polaroid",
    description: "폴라로이드 필름 안에 사진이 들어가는 타입",
    editableFields: ["groomNameEn", "brideNameEn", "date", "venue", "photo"],
    photo: "cover",
  },
  {
    id: "clean",
    name: "06 Clean Card",
    description: "이름과 예식 정보를 정갈하게 보여주는 타입",
    editableFields: ["groomNameEn", "brideNameEn", "date", "venue", "photo"],
    photo: "cover",
  },
];
