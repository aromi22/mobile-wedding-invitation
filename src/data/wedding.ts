import type { WeddingData } from "@/types/wedding";

export const wedding: WeddingData = {
  couple: {
    groom: {
      role: "신랑",
      name: "김민우",
      familyName: "김",
      givenName: "민우",
      englishName: "kim minwoo",
      profile: {
        birthYear: "1993년",
        hometown: "대구 수성구",
        mbti: "ENFJ",
        intro: "따뜻한 ENFJ",
        relationship: "신부 우선주의",
        tags: ["운동광", "계획적인남자"],
      },
      parents: {
        father: "김철수",
        fatherFamilyName: "김",
        fatherGivenName: "철수",
        fatherDeceased: false,
        mother: "이영희",
        motherFamilyName: "이",
        motherGivenName: "영희",
        motherDeceased: false,
        relation: "장남",
      },
      phone: "010-0000-0000",
      account: {
        bank: "신한은행",
        number: "110-000-000000",
        holder: "김민우",
      },
    },
    bride: {
      role: "신부",
      name: "김아름",
      familyName: "김",
      givenName: "아름",
      englishName: "kim areum",
      profile: {
        birthYear: "1995년",
        hometown: "서울 강남구",
        mbti: "ESTP",
        intro: "에너지 넘치는 ESTP",
        relationship: "신랑 우선주의",
        tags: ["냥만광", "즉흥적인여자"],
      },
      parents: {
        father: "이상훈",
        fatherFamilyName: "이",
        fatherGivenName: "상훈",
        fatherDeceased: false,
        mother: "박지은",
        motherFamilyName: "박",
        motherGivenName: "지은",
        motherDeceased: false,
        relation: "장녀",
      },
      phone: "010-1111-1111",
      account: {
        bank: "국민은행",
        number: "123456-00-000000",
        holder: "김아름",
      },
    },
  },
  event: {
    year: 2026,
    month: 10,
    day: 24,
    weekday: "토요일",
    time: "오후 1시",
    dateText: "2026년 10월 24일 토요일 오후 1시",
    calendarText: "2026.10.24 SAT 1:00 PM",
    venue: "라움 웨딩홀 3층 그랜드볼룸",
    address: "서울특별시 강남구 테헤란로 000",
    mapUrl: "https://map.kakao.com/",
  },
  message: {
    coverLine: "우리가 함께 걷게 될 모든 계절에",
    opening:
      "서로의 계절이 되어준 두 사람이\n이제 한 길을 함께 걷고자 합니다.",
    body:
      "소중한 분들을 모시고\n작은 약속의 자리를 마련했습니다.\n\n오셔서 따뜻한 마음으로 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.",
    footer: "귀한 걸음으로 함께해 주시는 모든 분들께 깊이 감사드립니다.",
  },
  photos: {
    // 실제 사진을 넣은 뒤 파일명만 바꾸면 됩니다. 예: "/images/main.jpg"
    cover: {
      src: "/images/do (1).jpg",
      alt: "신랑 신부 대표 사진",
      ratio: "portrait",
    },
    intro: {
      src: "/images/do (10).jpg",
      alt: "초대 문구와 함께 보여줄 사진",
      ratio: "portrait",
    },
    venue: {
      src: "/images/do (40).jpg",
      alt: "예식 정보 전후에 보여줄 사진",
      ratio: "landscape",
    },
    childhoodIllustration: {
      src: "/images/childhood-frame-illustration.png",
      alt: "신랑 신부 어릴 적 사진을 넣는 액자 일러스트",
      ratio: "portrait",
    },
    groomChildPhoto: {
      src: "",
      alt: "신랑 어릴 적 사진",
      ratio: "portrait",
      scale: 1,
    },
    brideChildPhoto: {
      src: "",
      alt: "신부 어릴 적 사진",
      ratio: "portrait",
      scale: 1,
    },
    gallery: [
      {
        src: "/images/do (3).jpg",
        alt: "웨딩 갤러리 사진 1",
        ratio: "portrait",
      },
      {
        src: "/images/do (15).jpg",
        alt: "웨딩 갤러리 사진 2",
        ratio: "portrait",
      },
      {
        src: "/images/do (24).jpg",
        alt: "웨딩 갤러리 사진 3",
        ratio: "portrait",
      },
      {
        src: "/images/do (31).jpg",
        alt: "웨딩 갤러리 사진 4",
        ratio: "portrait",
      },
      {
        src: "/images/do (40).jpg",
        alt: "웨딩 갤러리 사진 5",
        ratio: "landscape",
      },
      {
        src: "/images/do (52).jpg",
        alt: "웨딩 갤러리 사진 6",
        ratio: "portrait",
      },
    ],
  },
  hero: {
    letteringText: "Our Wedding Day",
    letteringFont: "segoe-print",
    letteringColor: "#ffffff",
    letteringTop: 48,
    letteringDuration: 1.45,
    mainText: "우리가 함께 걷게 될 모든 계절에",
    mainTextColor: "#ffffff",
    mainTextTop: 84,
    showEventInfo: true,
    showScrollHint: true,
  },
  sections: {
    openingMessage: true,
    story: true,
    qa: true,
    timeline: true,
    family: true,
    profile: true,
    calendar: true,
    location: true,
    gallery: true,
    accounts: true,
    rsvp: true,
    share: true,
    footer: true,
  },
  stories: [
    {
      title: "우리의 시작",
      body: "우연처럼 마주한 날들이\n자연스러운 약속이 되었습니다.\n\n서로의 하루를 묻고,\n작은 기쁨을 나누며\n같은 방향을 바라보게 되었습니다.",
      image: "/images/do (20).jpg",
      ratio: "portrait",
    },
    {
      title: "함께하는 계절",
      body: "평범한 날도 함께라면\n오래 기억하고 싶은 장면이 되었습니다.\n\n앞으로의 모든 계절도\n서로에게 가장 다정한 편이 되어\n걸어가겠습니다.",
      image: "/images/do (41).jpg",
      ratio: "portrait",
    },
  ],
  storyStyle: {
    type: "default",
    qaEnabled: true,
    timelineEnabled: true,
  },
  familySettings: {
    align: "center",
    showParents: true,
    deceasedFormat: "prefix",
    deceasedMarker: "hanja",
    coupleNameSeparator: "heart",
  },
  qa: [
    {
      id: "qa-1",
      question: "첫인상은 어땠나요?",
      answer:
        "처음부터 특별한 예감이 있었던 건 아니지만, 함께 대화할수록 오래 알고 지낸 사람처럼 편안했습니다.",
    },
    {
      id: "qa-2",
      question: "결혼을 결심한 순간은?",
      answer:
        "평범한 하루를 함께 보내는 일이 가장 큰 행복이라는 걸 알게 되었을 때, 앞으로도 이 사람과 함께하고 싶다고 생각했습니다.",
    },
    {
      id: "qa-3",
      question: "서로에게 한마디 한다면?",
      answer:
        "지금처럼 서로의 편이 되어주며, 다정한 마음을 잊지 않고 오래오래 함께 걸어가겠습니다.",
    },
  ],
  timeline: [
    {
      id: "timeline-1",
      title: "처음 만난 날",
      date: "첫 만남",
      body: "우연처럼 시작된 인연이 천천히 서로의 일상이 되었습니다.",
    },
    {
      id: "timeline-2",
      title: "첫 데이트",
      date: "설레던 어느 날",
      body: "어색한 웃음과 긴 대화가 아직도 선명하게 남아 있습니다.",
    },
    {
      id: "timeline-3",
      title: "함께한 시간",
      date: "우리의 계절",
      body: "평범한 날들도 함께라면 오래 기억하고 싶은 장면이 되었습니다.",
    },
    {
      id: "timeline-4",
      title: "결혼을 약속한 날",
      date: "새로운 시작",
      body: "서로의 가장 든든한 편이 되어 같은 방향을 바라보기로 했습니다.",
    },
  ],
  accounts: [
    {
      id: "groom",
      side: "groom",
      label: "신랑",
      bank: "신한은행",
      number: "110-000-000000",
      holder: "김민우",
      kakaoPayUrl: "",
    },
    {
      id: "bride",
      side: "bride",
      label: "신부",
      bank: "국민은행",
      number: "123456-00-000000",
      holder: "김아름",
      kakaoPayUrl: "",
    },
  ],
  music: {
    title: "샘플 음악 1",
    src: "/music/sample-1.wav",
  },
  rsvp: {
    label: "참석 여부 전달하기",
    url: "https://forms.gle/",
  },
};
