import Link from "next/link";
import { WeddingInvitation } from "@/components/WeddingInvitation";
import { wedding } from "@/data/wedding";

const features = [
  "모바일 화면에 맞춘 고급 청첩장 디자인",
  "사진, 이름, 날짜, 장소, 문구 직접 수정",
  "고객 전용 편집 링크와 최종 공유 링크 제공",
  "계좌 복사, 지도 보기, 참석 여부 링크 지원",
];

const steps = [
  "샘플 편집 화면을 체험합니다.",
  "구매 후 고객 전용 편집 링크를 받습니다.",
  "사진과 예식 정보를 직접 수정합니다.",
  "완성된 청첩장 링크를 하객에게 공유합니다.",
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
            감성 모바일 청첩장
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#6f6258]">
            사진과 예식 정보만 바꾸면 완성되는 모바일 청첩장 제작 서비스입니다. 구매
            전에는 데모로 편집 흐름을 체험하고, 구매 후에는 고객 전용 링크로 직접
            수정할 수 있어요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="rounded-full bg-[#332b24] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(51,43,36,0.18)]"
            >
              편집 체험하기
            </Link>
            <Link
              href="/edit"
              className="rounded-full border border-[#d5c2a6] bg-white/80 px-6 py-3 text-sm font-semibold text-[#6d583e]"
            >
              관리자 편집 열기
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[390px] rounded-[2rem] bg-[#eee5da] p-3 shadow-[0_24px_70px_rgba(91,70,42,0.2)]">
          <div className="max-h-[720px] overflow-hidden rounded-[1.4rem] bg-white">
            <WeddingInvitation data={wedding} />
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadfcd] bg-white/70 px-5 py-12">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#b29467]">Service</p>
            <h2 className="mt-3 text-2xl font-semibold">판매용 구성</h2>
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
          고객은 데모 페이지에서 이름, 날짜, 장소, 사진 URL을 바꿔보며 실제 제작 흐름을
          이해할 수 있습니다. 최종 저장 링크는 구매 후 발급하면 됩니다.
        </p>
        <Link
          href="/demo"
          className="mt-8 inline-flex rounded-full bg-[#b29467] px-7 py-3 text-sm font-semibold text-white"
        >
          데모 편집 화면 보기
        </Link>
      </section>
    </main>
  );
}
