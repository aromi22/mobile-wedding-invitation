import { EditInvitation } from "@/components/EditInvitation";

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <EditInvitation slug={decodeURIComponent(slug)} />;
}
