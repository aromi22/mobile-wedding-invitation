import { NextResponse } from "next/server";
import { getInvitationForEdit } from "@/lib/invitations";

type AdminPreviewRequest = {
  slug?: string;
  editSecret?: string;
  adminPaymentKey?: string;
};

function isValidAdminPaymentKey(key?: string) {
  return Boolean(process.env.ADMIN_PAYMENT_KEY && key === process.env.ADMIN_PAYMENT_KEY);
}

function formatWeddingDate(data: NonNullable<Awaited<ReturnType<typeof getInvitationForEdit>>>["design_settings"]) {
  return `${data.event.year}.${String(data.event.month).padStart(2, "0")}.${String(
    data.event.day,
  ).padStart(2, "0")} ${data.event.weekday} ${data.event.time}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdminPreviewRequest;
    const slug = body.slug?.trim();
    const editSecret = body.editSecret?.trim();

    if (!process.env.ADMIN_PAYMENT_KEY) {
      return NextResponse.json(
        { message: "Vercel 환경변수 ADMIN_PAYMENT_KEY가 아직 설정되지 않았어요." },
        { status: 500 },
      );
    }

    if (!isValidAdminPaymentKey(body.adminPaymentKey)) {
      return NextResponse.json({ message: "관리자 비밀번호가 맞지 않아요." }, { status: 403 });
    }

    if (!slug || !editSecret) {
      return NextResponse.json(
        { message: "고객 수정 링크를 확인하지 못했어요. 링크를 다시 붙여넣어 주세요." },
        { status: 400 },
      );
    }

    const invitation = await getInvitationForEdit(slug, editSecret);

    if (!invitation) {
      return NextResponse.json(
        { message: "청첩장을 불러오지 못했어요. 고객 수정 링크가 맞는지 확인해 주세요." },
        { status: 404 },
      );
    }

    const data = invitation.design_settings;

    return NextResponse.json({
      summary: {
        slug: invitation.slug,
        groomName: data.couple.groom.name,
        brideName: data.couple.bride.name,
        weddingDate: formatWeddingDate(data),
        venueName: data.event.venue,
        venueAddress: data.event.address,
        isPaid: Boolean(data.payment.isPaid),
        shareUrlPath: `/w/${invitation.slug}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "청첩장 정보 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }
}
