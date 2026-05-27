import { SharedInvitation } from "@/components/SharedInvitation";

export default async function SharedInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <SharedInvitation slug={decodeURIComponent(slug)} />;
}
