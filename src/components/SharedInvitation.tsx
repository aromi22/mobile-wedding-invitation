"use client";

import { useEffect, useState } from "react";
import { getInvitationBySlug, invitationRowToWeddingData } from "@/lib/invitations";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { WeddingData } from "@/types/wedding";
import { WeddingInvitation } from "@/components/WeddingInvitation";

export function SharedInvitation({ slug }: { slug: string }) {
  const [data, setData] = useState<WeddingData | null>(null);
  const [message, setMessage] = useState("청첩장을 불러오고 있어요.");

  useEffect(() => {
    async function loadInvitation() {
      if (!isSupabaseConfigured()) {
        setMessage("Supabase 환경변수가 아직 설정되지 않았습니다.");
        return;
      }

      try {
        const row = await getInvitationBySlug(slug);

        if (!row) {
          setMessage("청첩장을 찾을 수 없습니다.");
          return;
        }

        setData(invitationRowToWeddingData(row));
      } catch {
        setMessage("청첩장을 불러오는 중 문제가 생겼습니다.");
      }
    }

    loadInvitation();
  }, [slug]);

  if (data) {
    return <WeddingInvitation data={data} />;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[430px] items-center justify-center bg-white px-7 text-center text-[#332b24]">
      <p className="text-sm leading-7 text-[#7c6e62]">{message}</p>
    </main>
  );
}
