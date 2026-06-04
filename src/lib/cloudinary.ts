const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
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
