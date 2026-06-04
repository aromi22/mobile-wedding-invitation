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
        ? "Supabase 저장 서버에 연결하지 못했어요. 로컬에서는 인터넷/방화벽 문제로 막힐 수 있고, 배포된 사이트에서는 다시 저장해 주세요."
        : rawMessage;

    return NextResponse.json({ message }, { status: 500 });
  }
}
