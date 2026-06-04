function cleanEnvValue(value: string, key: string) {
  const trimmed = value.trim();
  const matchingLine =
    trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.startsWith(key)) ?? trimmed;

  return matchingLine
    .replace(new RegExp(`^${key}\\s*=\\s*`), "")
    .replace(/^["']|["']$/g, "")
    .replace(/\s/g, "")
    .trim();
}

const CLOUDINARY_CLOUD_NAME = cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME ?? "", "CLOUDINARY_CLOUD_NAME");
const CLOUDINARY_API_KEY = cleanEnvValue(process.env.CLOUDINARY_API_KEY ?? "", "CLOUDINARY_API_KEY");
const CLOUDINARY_API_SECRET = cleanEnvValue(
  process.env.CLOUDINARY_API_SECRET ?? "",
  "CLOUDINARY_API_SECRET",
);

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

export function getCloudinaryConfigStatus() {
  return {
    cloudName: Boolean(CLOUDINARY_CLOUD_NAME),
    apiKey: Boolean(CLOUDINARY_API_KEY),
    apiSecret: Boolean(CLOUDINARY_API_SECRET),
    cloudNameLength: CLOUDINARY_CLOUD_NAME.length,
    apiKeyLength: CLOUDINARY_API_KEY.length,
    apiSecretLength: CLOUDINARY_API_SECRET.length,
  };
}

async function createSignature(params: Record<string, string | number>) {
  const { createHash } = await import("node:crypto");
  const signatureBase = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${signatureBase}${CLOUDINARY_API_SECRET}`).digest("hex");
}

export async function uploadCloudinaryImage(file: Blob, options: { slug: string; name: string }) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary 환경변수가 아직 설정되지 않았어요.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `mobile-wedding-invitations/${options.slug}`;
  const publicId = options.name;
  const signature = await createSignature({
    folder,
    overwrite: "true",
    public_id: publicId,
    timestamp,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("overwrite", "true");
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  const result = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? "Cloudinary 이미지 업로드에 실패했어요.");
  }

  return result.secure_url;
}

export function getCloudinaryRawJsonUrl(slug: string, name: string) {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/mobile-wedding-invitations/${slug}/${name}.json`;
}

export async function uploadCloudinaryJson(
  data: unknown,
  options: { slug: string; name: string },
) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary 환경변수가 아직 설정되지 않았어요.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `mobile-wedding-invitations/${options.slug}`;
  const publicId = options.name;
  const signature = await createSignature({
    folder,
    overwrite: "true",
    public_id: publicId,
    timestamp,
  });

  const file = new Blob([JSON.stringify(data)], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("overwrite", "true");
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  const result = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? "Cloudinary 데이터 저장에 실패했어요.");
  }

  return result.secure_url;
}

export async function fetchCloudinaryJson<T>(slug: string, name: string) {
  if (!CLOUDINARY_CLOUD_NAME) {
    return null;
  }

  const response = await fetch(getCloudinaryRawJsonUrl(slug, name), {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}
