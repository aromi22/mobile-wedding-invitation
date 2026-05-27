import { wedding } from "@/data/wedding";
import type { WeddingData, WeddingPhoto } from "@/types/wedding";
import { supabaseFetch, uploadPublicFile } from "@/lib/supabase";

export type InvitationRow = {
  id?: string;
  slug: string;
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

function safeSlugPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function createInvitationSlug(data: WeddingData) {
  const names = safeSlugPart(`${data.couple.groom.name}-${data.couple.bride.name}`) || "wedding";
  const date = `${data.event.year}${String(data.event.month).padStart(2, "0")}${String(
    data.event.day,
  ).padStart(2, "0")}`;
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : String(Date.now()).slice(-8);

  return `${names}-${date}-${suffix}`;
}

export function weddingDataToInvitationRow(data: WeddingData, slug: string): InvitationRow {
  return {
    slug,
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
  next.photos.gallery = await Promise.all(
    next.photos.gallery.map(async (photo, index) => ({
      ...photo,
      src: await uploadDataUrlImage(photo.src, slug, `gallery-${index + 1}`),
    })),
  );

  return next;
}

export async function saveInvitation(data: WeddingData, slug = createInvitationSlug(data)) {
  const uploadedData = await uploadInvitationImages(data, slug);
  const row = weddingDataToInvitationRow(uploadedData, slug);

  const rows = await supabaseFetch<InvitationRow[]>(
    "/rest/v1/invitations?on_conflict=slug",
    {
      method: "POST",
      body: row,
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
    },
  );

  return rows[0];
}

export async function getInvitationBySlug(slug: string) {
  const rows = await supabaseFetch<InvitationRow[]>(
    `/rest/v1/invitations?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
  );

  return rows[0] ?? null;
}
