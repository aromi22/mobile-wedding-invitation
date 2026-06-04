import { NextResponse } from "next/server";
import { fetchCloudinaryJson, uploadCloudinaryJson } from "@/lib/cloudinary";
import { getInvitationForEdit, saveInvitation } from "@/lib/invitations";

type UnlockRequest = {
  slug?: string;
  editSecret?: string;
  orderNumber?: string;
};

type UsedOrder = {
  orderNumber: string;
  slug: string;
  usedAt: string;
};

type UsedOrderStore = {
  orders: UsedOrder[];
};

const PAYMENT_STORE_SLUG = "__payment-orders";
const PAYMENT_STORE_NAME = "used-orders";

function normalizeOrderNumber(value = "") {
  return value.replace(/[\s-]/g, "").trim();
}

function getAllowedOrderNumbers() {
  const raw =
    process.env.VALID_ORDER_NUMBERS ??
    process.env.NAVER_ORDER_NUMBERS ??
    process.env.ORDER_NUMBER_ALLOWLIST ??
    "";

  return raw
    .split(/[\s,\n\r]+/)
    .map(normalizeOrderNumber)
    .filter(Boolean);
}

async function loadUsedOrders(): Promise<UsedOrderStore> {
  return (
    (await fetchCloudinaryJson<UsedOrderStore>(PAYMENT_STORE_SLUG, PAYMENT_STORE_NAME)) ?? {
      orders: [],
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UnlockRequest;
    const slug = body.slug?.trim();
    const editSecret = body.editSecret?.trim();
    const orderNumber = normalizeOrderNumber(body.orderNumber);

    if (!slug || !editSecret) {
      return NextResponse.json(
        { message: "고객용 편집 링크에서만 워터마크를 제거할 수 있어요." },
        { status: 400 },
      );
    }

    if (!orderNumber) {
      return NextResponse.json({ message: "주문번호를 입력해 주세요." }, { status: 400 });
    }

    const allowedOrderNumbers = getAllowedOrderNumbers();

    if (!allowedOrderNumbers.length) {
      return NextResponse.json(
        {
          message:
            "등록된 주문번호 목록이 없어요. Vercel 환경변수 VALID_ORDER_NUMBERS를 먼저 설정해 주세요.",
        },
        { status: 500 },
      );
    }

    if (!allowedOrderNumbers.includes(orderNumber)) {
      return NextResponse.json(
        { message: "확인되지 않은 주문번호예요. 주문번호를 다시 확인해 주세요." },
        { status: 403 },
      );
    }

    const invitation = await getInvitationForEdit(slug, editSecret);

    if (!invitation) {
      return NextResponse.json(
        { message: "편집 권한을 확인하지 못했어요. 고객용 편집 링크가 맞는지 확인해 주세요." },
        { status: 404 },
      );
    }

    const usedStore = await loadUsedOrders();
    const usedOrder = usedStore.orders.find((order) => order.orderNumber === orderNumber);

    if (usedOrder && usedOrder.slug !== slug) {
      return NextResponse.json(
        { message: "이미 다른 청첩장에 사용된 주문번호예요." },
        { status: 409 },
      );
    }

    const nextData = structuredClone(invitation.design_settings);
    nextData.payment = {
      ...nextData.payment,
      isPaid: true,
    };

    const saved = await saveInvitation(nextData, { slug, editSecret });

    if (!usedOrder) {
      await uploadCloudinaryJson(
        {
          orders: [
            ...usedStore.orders,
            {
              orderNumber,
              slug,
              usedAt: new Date().toISOString(),
            },
          ],
        } satisfies UsedOrderStore,
        { slug: PAYMENT_STORE_SLUG, name: PAYMENT_STORE_NAME },
      );
    }

    return NextResponse.json({
      ...saved,
      message: "워터마크가 제거됐어요. 이제 최종 링크를 공유할 수 있습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "워터마크 제거 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }
}
