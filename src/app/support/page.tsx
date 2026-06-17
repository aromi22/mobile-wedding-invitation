const supportItems = [
  "제작 중 사진이 보이지 않거나 저장되지 않을 때",
  "결제 후 워터마크 제거가 필요할 때",
  "카카오맵, 카카오페이 송금 링크 연결이 어려울 때",
  "고객 수정 링크 또는 최종 공유 링크를 잃어버렸을 때",
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f6] text-[#191919]">
      <header className="border-b border-[#e7e7e7] bg-white">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5">
          <a href="/" className="text-2xl font-semibold tracking-[-0.05em]">moink</a>
          <nav className="flex gap-5 text-sm">
            <a href="/guide">가이드</a>
            <a href="/faq">FAQ</a>
            <a href="/support" className="font-semibold">고객센터</a>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-sm font-semibold text-[#777]">Support</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">고객센터</h1>
        <p className="mt-4 text-base leading-8 text-[#666]">
          제작 중 막히는 부분이 있으면 아래 정보를 정리해서 문의해 주세요.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[18px] border border-[#dedede] bg-white p-7">
            <h2 className="text-xl font-semibold">문의 전 확인해 주세요</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-[#555]">
              {supportItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-[18px] border border-[#dedede] bg-white p-7">
            <h2 className="text-xl font-semibold">문의 시 필요한 정보</h2>
            <p className="mt-5 text-sm leading-7 text-[#555]">
              주문번호, 고객 수정 링크, 문제가 생긴 화면 캡처를 함께 보내주시면 더 빠르게 확인할 수 있어요.
            </p>
            <a
              href="/make"
              className="mt-8 inline-flex rounded-[10px] bg-[#191919] px-5 py-3 text-sm font-semibold text-white"
            >
              제작 페이지로 이동
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
