import { NextResponse } from "next/server";
import { getCloudinaryConfigStatus, isCloudinaryConfigured } from "@/lib/cloudinary";
import { isSupabaseConfigured, SUPABASE_URL } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    cloudinaryConfigured: isCloudinaryConfigured(),
    cloudinary: getCloudinaryConfigStatus(),
    supabaseConfigured: isSupabaseConfigured(),
    supabaseHost: SUPABASE_URL ? new URL(SUPABASE_URL).host : "",
  });
}
