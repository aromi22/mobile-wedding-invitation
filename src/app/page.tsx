import Link from "next/link";
import { LandingInvitationPreview } from "@/components/LandingInvitationPreview";

const features = [
  "모바일 화면에 맞춘 감성 청첩장 디자인",
  "사진, 이름, 날짜, 장소, 문구 직접 수정",
  "구매 전 워터마크 제작본 저장 가능",
  "결제 확인 후 워터마크 제거",
];

const steps = [
  "지금 바로 만들어보기에서 청첩장을 제작합니다.",
  "제작본 링크를 확인한 뒤 스마트스토어에서 결제합니다.",
  "결제 확인 후 워터마크 제거를 요청합니다.",
  "워터마크가 제거된 최종 링크를 하객에게 공유합니다.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f4ee] text-[#332b24]">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-16">
        <div className="py-4">
          <p className="text-xs uppercase tracking-[0.32em] text-[#b29467]">
            Mobile Wedding Invitation
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            고객이 직접 완성하는
            <br />
            모바일 청첩장
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#6f6258]">
            사진과 예식 정보만 바꾸면 완성되는 모바일 청첩장 제작 서비스입니다.
            구매 전에는 데모로 편집 흐름을 체험하고, 구매 후에는 고객 전용
            링크에서 직접 수정할 수 있어요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/make"
              className="rounded-full bg-[#332b24] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(51,43,36,0.18)]"
            >
              지금 바로 만들어보기
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[390px] rounded-[2rem] bg-[#eee5da] p-3 shadow-[0_24px_70px_rgba(91,70,42,0.2)]">
          <div className="max-h-[720px] overflow-hidden rounded-[1.4rem] bg-white">
            <LandingInvitationPreview />
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadfcd] bg-white/70 px-5 py-12">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#b29467]">Service</p>
            <h2 className="mt-3 text-2xl font-semibold">판매 구성</h2>
            <div className="mt-6 grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="border-b border-[#eadfcd] pb-3 text-[#5f5349]">
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#b29467]">Flow</p>
            <h2 className="mt-3 text-2xl font-semibold">고객 이용 흐름</h2>
            <ol className="mt-6 grid gap-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-4 text-[#5f5349]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d5c2a6] text-sm text-[#9b7b4f]">
                    {index + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-[#b29467]">Try First</p>
        <h2 className="mt-3 text-3xl font-semibold">구매 전, 편집 방식을 먼저 보여주세요</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#6f6258]">
          고객은 제작 페이지에서 이름, 날짜, 장소, 사진 URL을 바꿔보며 실제
          청첩장을 만들 수 있습니다. 구매 전 제작본에는 워터마크가 표시되고,
          결제 확인 후 워터마크가 제거됩니다.
        </p>
        <Link
          href="/make"
          className="mt-8 inline-flex rounded-full bg-[#b29467] px-7 py-3 text-sm font-semibold text-white"
        >
          워터마크 제작본 만들기
        </Link>
      </section>
    </main>
  );
}
