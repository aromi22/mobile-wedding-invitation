import { NextResponse } from "next/server";
import { getInvitationForEdit, saveInvitation } from "@/lib/invitations";

type AdminUnlockRequest = {
  slug?: string;
  editSecret?: string;
  adminPaymentKey?: string;
};

function isValidAdminPaymentKey(key?: string) {
  return Boolean(process.env.ADMIN_PAYMENT_KEY && key === process.env.ADMIN_PAYMENT_KEY);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdminUnlockRequest;
    const slug = body.slug?.trim();
    const editSecret = body.editSecret?.trim();

    if (!process.env.ADMIN_PAYMENT_KEY) {
      return NextResponse.json(
        { message: "Vercel 환경변수 ADMIN_PAYMENT_KEY가 아직 설정되지 않았어요." },
        { status: 500 },
      );
    }

    if (!isValidAdminPaymentKey(body.adminPaymentKey)) {
      return NextResponse.json(
        { message: "관리자 비밀번호가 맞지 않아요." },
        { status: 403 },
      );
    }

    if (!slug || !editSecret) {
      return NextResponse.json(
        { message: "고객 편집 링크를 확인하지 못했어요. 링크를 다시 붙여넣어 주세요." },
        { status: 400 },
      );
    }

    const invitation = await getInvitationForEdit(slug, editSecret);

    if (!invitation) {
      return NextResponse.json(
        { message: "청첩장을 불러오지 못했어요. 고객 편집 링크가 맞는지 확인해 주세요." },
        { status: 404 },
      );
    }

    const nextData = structuredClone(invitation.design_settings);
    nextData.payment = {
      ...nextData.payment,
      isPaid: true,
    };

    const saved = await saveInvitation(nextData, { slug, editSecret });

    return NextResponse.json({
      ...saved,
      message: "결제 완료 처리됐어요. 최종 링크에서 워터마크가 제거됩니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "결제 완료 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }
}
