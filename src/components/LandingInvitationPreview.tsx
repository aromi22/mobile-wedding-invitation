"use client";

import { wedding } from "@/data/wedding";
import { WeddingInvitation } from "@/components/WeddingInvitation";

export function LandingInvitationPreview() {
  return <WeddingInvitation data={wedding} />;
}
