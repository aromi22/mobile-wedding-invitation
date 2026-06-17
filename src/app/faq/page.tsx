const faqs = [
  {
    question: "사진은 몇 장까지 넣을 수 있나요?",
    answer: "갤러리는 최대 50장까지 넣을 수 있어요. 모바일에서 보기 좋도록 너무 큰 사진은 자동으로 줄여 저장합니다.",
  },
  {
    question: "제작 중인 내용은 다른 사람에게 보이나요?",
    answer: "브라우저 임시 저장 내용은 본인 기기에만 남아요. 링크 만들기를 눌러 생성한 공유 링크만 다른 사람이 볼 수 있습니다.",
  },
  {
    question: "결제 전에도 청첩장을 만들어볼 수 있나요?",
    answer: "가능해요. 결제 전 제작본에는 워터마크가 표시되고, 결제 확인 후 워터마크가 제거된 최종 링크로 사용할 수 있어요.",
  },
  {
    question: "결제 후에도 수정할 수 있나요?",
    answer: "고객 수정 링크가 있으면 결제 후에도 내용을 다시 수정하고 저장할 수 있어요.",
  },
  {
    question: "계좌 복사와 카카오페이 송금을 같이 쓸 수 있나요?",
    answer: "네. 은행 계좌 복사 버튼과 카카오페이 송금 링크 버튼을 함께 표시할 수 있습니다.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f6] text-[#191919]">
      <header className="border-b border-[#e7e7e7] bg-white">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5">
          <a href="/" className="text-2xl font-semibold tracking-[-0.05em]">moink</a>
          <nav className="flex gap-5 text-sm">
            <a href="/guide">가이드</a>
            <a href="/faq" className="font-semibold">FAQ</a>
            <a href="/support">고객센터</a>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-sm font-semibold text-[#777]">FAQ</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">자주 묻는 질문</h1>
        <div className="mt-10 grid gap-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-[18px] border border-[#dedede] bg-white p-7">
              <h2 className="text-lg font-semibold">{faq.question}</h2>
              <p className="mt-3 text-sm leading-7 text-[#555]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
