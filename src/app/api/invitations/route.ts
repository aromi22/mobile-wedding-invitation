import { NextResponse } from "next/server";
import { getInvitationForEdit, saveInvitation } from "@/lib/invitations";
import type { WeddingData } from "@/types/wedding";

type SaveInvitationRequest = {
  data?: WeddingData;
  slug?: string;
  editSecret?: string;
  adminPaymentKey?: string;
};

function isValidAdminPaymentKey(key?: string) {
  return Boolean(process.env.ADMIN_PAYMENT_KEY && key === process.env.ADMIN_PAYMENT_KEY);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveInvitationRequest;

    if (!body.data) {
      return NextResponse.json({ message: "저장할 청첩장 정보가 없어요." }, { status: 400 });
    }

    const dataToSave = structuredClone(body.data);
    const wantsPaid = Boolean(dataToSave.payment?.isPaid);
    const canMarkPaid = isValidAdminPaymentKey(body.adminPaymentKey);

    if (wantsPaid && !canMarkPaid) {
      const existing =
        body.slug && body.editSecret
          ? await getInvitationForEdit(body.slug, body.editSecret)
          : null;

      dataToSave.payment.isPaid = Boolean(existing?.design_settings?.payment?.isPaid);
    }

    const saved = await saveInvitation(dataToSave, {
      slug: body.slug,
      editSecret: body.editSecret,
    });

    return NextResponse.json(saved);
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : "저장 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
    const message =
      rawMessage === "fetch failed" || rawMessage.includes("ENOTFOUND")
        ? "저장 서버에 연결하지 못했어요. Supabase 또는 Cloudinary 설정을 확인해 주세요."
        : rawMessage;

    return NextResponse.json({ message }, { status: 500 });
  }
}
