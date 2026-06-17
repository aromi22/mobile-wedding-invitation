const guideSections = [
  {
    title: "모바일 청첩장 만드는 순서",
    items: [
      "기본 정보에서 신랑, 신부 이름과 예식 날짜, 장소를 입력합니다.",
      "디자인에서 첫 화면 타입, 사진, 문구, 갤러리와 선택 섹션을 정리합니다.",
      "계좌·참석에서 계좌 정보와 참석 여부 전달 기능을 설정합니다.",
      "공유 설정에서 음악과 지도 링크를 확인한 뒤 링크 만들기를 누릅니다.",
      "제작본 링크를 확인하고 결제 후 최종 링크로 공유합니다.",
    ],
  },
  {
    title: "카카오맵 링크 연결하기",
    items: [
      "카카오맵에서 예식장을 검색합니다.",
      "공유 버튼을 눌러 장소 링크를 복사합니다.",
      "제작 페이지의 공유 설정에서 지도 링크 칸에 붙여넣습니다.",
      "청첩장 미리보기에서 지도 보기 버튼을 눌러 정상 연결되는지 확인합니다.",
    ],
  },
  {
    title: "카카오 송금 링크 받는 방법",
    items: [
      "카카오톡 또는 카카오페이에서 송금받기 링크를 생성합니다.",
      "생성된 링크를 복사한 뒤 계좌 정보의 카카오페이 송금 링크 칸에 입력합니다.",
      "링크를 입력하면 청첩장 계좌 영역에 송금 버튼이 함께 표시됩니다.",
      "은행 계좌 복사 기능과 송금 링크를 함께 사용할 수 있습니다.",
    ],
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#f6f6f6] text-[#191919]">
      <header className="border-b border-[#e7e7e7] bg-white">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5">
          <a href="/" className="text-2xl font-semibold tracking-[-0.05em]">moink</a>
          <nav className="flex gap-5 text-sm">
            <a href="/guide" className="font-semibold">가이드</a>
            <a href="/faq">FAQ</a>
            <a href="/support">고객센터</a>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-sm font-semibold text-[#777]">Guide</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">청첩장 제작 가이드</h1>
        <p className="mt-4 text-base leading-8 text-[#666]">
          처음 만드는 분들도 순서대로 따라오면 제작본부터 최종 공유 링크까지 완성할 수 있어요.
        </p>
        <div className="mt-10 grid gap-5">
          {guideSections.map((section, index) => (
            <article key={section.title} className="rounded-[18px] border border-[#dedede] bg-white p-7">
              <p className="text-sm font-semibold text-[#999]">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 text-xl font-semibold">{section.title}</h2>
              <ol className="mt-5 grid gap-3 text-sm leading-7 text-[#555]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
