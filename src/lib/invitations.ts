import { wedding } from "@/data/wedding";
import type { WeddingData, WeddingPhoto } from "@/types/wedding";
import { supabaseFetch, uploadPublicFile } from "@/lib/supabase";

export type InvitationRow = {
  id?: string;
  slug: string;
  edit_secret?: string;
  edit_secret_hash?: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  wedding_time: string;
  venue_name: string;
  venue_address: string;
  invitation_text: string;
  family_info: WeddingData["couple"] & {
    settings: WeddingData["familySettings"];
  };
  design_settings: WeddingData;
  cover_image_url: string;
  gallery_images: WeddingPhoto[];
  music_url: string | null;
  qa_items: WeddingData["qa"];
  story_items: WeddingData["timeline"];
  account_info: WeddingData["accounts"];
  rsvp_enabled: boolean;
  guestbook_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

const INVITATION_PUBLIC_COLUMNS = [
  "id",
  "slug",
  "groom_name",
  "bride_name",
  "wedding_date",
  "wedding_time",
  "venue_name",
  "venue_address",
  "invitation_text",
  "family_info",
  "design_settings",
  "cover_image_url",
  "gallery_images",
  "music_url",
  "qa_items",
  "story_items",
  "account_info",
  "rsvp_enabled",
  "guestbook_enabled",
  "created_at",
  "updated_at",
].join(",");

function safeSlugPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function createInvitationSlug(data: WeddingData) {
  const date = `${data.event.year}${String(data.event.month).padStart(2, "0")}${String(
    data.event.day,
  ).padStart(2, "0")}`;
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : String(Date.now()).slice(-8);

  return `wedding-${date}-${suffix}`;
}

export function createEditSecret() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now()}${Math.random().toString(36).slice(2)}`;
}

export function weddingDataToInvitationRow(
  data: WeddingData,
  slug: string,
  editSecret?: string,
): InvitationRow {
  return {
    slug,
    ...(editSecret ? { edit_secret: editSecret } : {}),
    groom_name: data.couple.groom.name,
    bride_name: data.couple.bride.name,
    wedding_date: `${data.event.year}-${String(data.event.month).padStart(2, "0")}-${String(
      data.event.day,
    ).padStart(2, "0")}`,
    wedding_time: data.event.time,
    venue_name: data.event.venue,
    venue_address: data.event.address,
    invitation_text: data.message.body,
    family_info: {
      ...data.couple,
      settings: data.familySettings,
    },
    design_settings: data,
    cover_image_url: data.photos.cover.src,
    gallery_images: data.photos.gallery,
    music_url: data.music?.src ?? null,
    qa_items: data.qa,
    story_items: data.timeline,
    account_info: data.accounts,
    rsvp_enabled: Boolean(data.rsvp.url),
    guestbook_enabled: false,
  };
}

export function invitationRowToWeddingData(row: InvitationRow): WeddingData {
  const data = structuredClone(row.design_settings ?? wedding);

  data.photos = {
    ...wedding.photos,
    ...data.photos,
  };
  data.sections = {
    ...wedding.sections,
    ...data.sections,
  };
  data.payment = {
    ...wedding.payment,
    ...data.payment,
  };
  data.couple.groom.profile = {
    ...wedding.couple.groom.profile,
    ...data.couple.groom.profile,
  };
  data.couple.bride.profile = {
    ...wedding.couple.bride.profile,
    ...data.couple.bride.profile,
  };
  data.couple.groom.name = row.groom_name || data.couple.groom.name;
  data.couple.bride.name = row.bride_name || data.couple.bride.name;
  data.event.venue = row.venue_name || data.event.venue;
  data.event.address = row.venue_address || data.event.address;
  data.message.body = row.invitation_text || data.message.body;
  data.photos.cover.src = row.cover_image_url || data.photos.cover.src;
  data.photos.gallery = row.gallery_images?.length ? row.gallery_images : data.photos.gallery;
  data.music = row.music_url ? { title: "저장된 배경음악", src: row.music_url } : data.music;
  data.qa = row.qa_items?.length ? row.qa_items : data.qa;
  data.timeline = row.story_items?.length ? row.story_items : data.timeline;
  data.accounts = row.account_info?.length ? row.account_info : data.accounts;

  return data;
}

function dataUrlToFile(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const contentType = meta.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: contentType });
}

async function uploadDataUrlImage(src: string, slug: string, name: string) {
  if (!src.startsWith("data:")) {
    return src;
  }

  const file = dataUrlToFile(src);
  const extension = file.type.split("/")[1] || "jpg";
  return uploadPublicFile(`${slug}/${name}.${extension}`, file, file.type);
}

export async function uploadInvitationImages(data: WeddingData, slug: string): Promise<WeddingData> {
  const next = structuredClone(data);

  next.photos.cover.src = await uploadDataUrlImage(next.photos.cover.src, slug, "cover");
  if (next.photos.groomChildPhoto?.src) {
    next.photos.groomChildPhoto.src = await uploadDataUrlImage(
      next.photos.groomChildPhoto.src,
      slug,
      "groom-child",
    );
  }
  if (next.photos.brideChildPhoto?.src) {
    next.photos.brideChildPhoto.src = await uploadDataUrlImage(
      next.photos.brideChildPhoto.src,
      slug,
      "bride-child",
    );
  }
  next.photos.gallery = await Promise.all(
    next.photos.gallery.map(async (photo, index) => ({
      ...photo,
      src: await uploadDataUrlImage(photo.src, slug, `gallery-${index + 1}`),
    })),
  );

  return next;
}

export async function saveInvitation(
  data: WeddingData,
  options: { slug?: string; editSecret?: string } = {},
) {
  const slug = options.slug ?? createInvitationSlug(data);
  const editSecret = options.editSecret ?? createEditSecret();
  const uploadedData = await uploadInvitationImages(data, slug);
  const row = weddingDataToInvitationRow(
    uploadedData,
    slug,
    options.slug ? undefined : editSecret,
  );

  if (options.slug) {
    const rows = await supabaseFetch<InvitationRow[]>(
      `/rest/v1/invitations?slug=eq.${encodeURIComponent(slug)}&select=${INVITATION_PUBLIC_COLUMNS}`,
      {
        method: "PATCH",
        body: row,
        headers: {
          Prefer: "return=representation",
          "x-edit-secret": editSecret,
        },
      },
    );

    if (!rows[0]) {
      throw new Error("편집 권한을 확인하지 못했어요. 고객용 편집 링크가 맞는지 확인해 주세요.");
    }

    return { row: rows[0], editSecret };
  }

  const rows = await supabaseFetch<InvitationRow[]>(
    `/rest/v1/invitations?select=${INVITATION_PUBLIC_COLUMNS}`,
    {
      method: "POST",
      body: row,
      headers: {
        Prefer: "return=representation",
      },
    },
  );

  return { row: rows[0], editSecret };
}

export async function getInvitationBySlug(slug: string) {
  const rows = await supabaseFetch<InvitationRow[]>(
    `/rest/v1/invitations?slug=eq.${encodeURIComponent(
      slug,
    )}&select=${INVITATION_PUBLIC_COLUMNS}&limit=1`,
  );

  return rows[0] ?? null;
}

export async function getInvitationForEdit(slug: string, editSecret: string) {
  const rows = await supabaseFetch<InvitationRow[]>(
    `/rest/v1/invitations?slug=eq.${encodeURIComponent(
      slug,
    )}&select=${INVITATION_PUBLIC_COLUMNS}&limit=1`,
    {
      headers: {
        "x-edit-secret": editSecret,
      },
    },
  );

  return rows[0] ?? null;
}
