import { NextResponse } from "next/server";
import { fetchCloudinaryJson, uploadCloudinaryJson } from "@/lib/cloudinary";
import { getInvitationForEdit } from "@/lib/invitations";
import type { WeddingRsvpResponse } from "@/types/wedding";

type RsvpStore = {
  responses: WeddingRsvpResponse[];
};

type SubmitRsvpRequest = {
  slug?: string;
  response?: Omit<WeddingRsvpResponse, "id" | "createdAt">;
};

const RSVP_STORE_NAME = "rsvp-responses";

function createResponseId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function readRsvpStore(slug: string): Promise<RsvpStore> {
  return (await fetchCloudinaryJson<RsvpStore>(slug, RSVP_STORE_NAME)) ?? { responses: [] };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitRsvpRequest;

    if (!body.slug || !body.response) {
      return NextResponse.json({ message: "참석 여부 정보가 부족해요." }, { status: 400 });
    }

    const store = await readRsvpStore(body.slug);
    const response: WeddingRsvpResponse = {
      id: createResponseId(),
      createdAt: new Date().toISOString(),
      ...body.response,
    };

    const nextStore = {
      responses: [response, ...store.responses].slice(0, 500),
    };

    await uploadCloudinaryJson(nextStore, { slug: body.slug, name: RSVP_STORE_NAME });

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "참석 여부를 저장하는 중 문제가 생겼어요.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") ?? "";
    const editSecret = searchParams.get("key") ?? searchParams.get("secret") ?? "";

    if (!slug || !editSecret) {
      return NextResponse.json({ message: "편집 링크 정보가 부족해요." }, { status: 400 });
    }

    const invitation = await getInvitationForEdit(slug, editSecret);

    if (!invitation) {
      return NextResponse.json({ message: "응답을 확인할 권한이 없어요." }, { status: 403 });
    }

    const store = await readRsvpStore(slug);

    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "참석 여부 목록을 불러오는 중 문제가 생겼어요.",
      },
      { status: 500 },
    );
  }
}
