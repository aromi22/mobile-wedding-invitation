import { NextResponse } from "next/server";
import { saveInvitation } from "@/lib/invitations";
import type { WeddingData } from "@/types/wedding";

type SaveInvitationRequest = {
  data?: WeddingData;
  slug?: string;
  editSecret?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveInvitationRequest;

    if (!body.data) {
      return NextResponse.json({ message: "저장할 청첩장 정보가 없어요." }, { status: 400 });
    }

    const saved = await saveInvitation(body.data, {
      slug: body.slug,
      editSecret: body.editSecret,
    });

    return NextResponse.json(saved);
  } catch (error) {
    const rawMessage =
      error instanceof Error
        ? error.message
        : "저장 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
    const message =
      rawMessage === "fetch failed" || rawMessage.includes("ENOTFOUND")
        ? "저장 서버에 연결하지 못했어요. Supabase 또는 Cloudinary 환경변수와 서비스 상태를 확인해 주세요."
        : rawMessage;

    return NextResponse.json({ message }, { status: 500 });
  }
}
