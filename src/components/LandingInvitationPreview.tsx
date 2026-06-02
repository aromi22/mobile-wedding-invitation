"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/data/wedding";
import { EDITOR_STORAGE_KEY } from "@/lib/editorStorage";
import type { WeddingData } from "@/types/wedding";
import { WeddingInvitation } from "@/components/WeddingInvitation";

export function LandingInvitationPreview() {
  const [preview, setPreview] = useState<WeddingData>(wedding);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(EDITOR_STORAGE_KEY);

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as WeddingData;

      if (parsed?.photos && parsed?.couple && parsed?.event) {
        setPreview(parsed);
      }
    } catch {
      setPreview(wedding);
    }
  }, []);

  return <WeddingInvitation data={preview} />;
}
