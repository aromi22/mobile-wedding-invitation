import { WeddingInvitation } from "@/components/WeddingInvitation";
import { getInvitationBySlug, invitationRowToWeddingData } from "@/lib/invitations";

export async function SharedInvitation({ slug }: { slug: string }) {
  const row = await getInvitationBySlug(slug);

  if (row) {
    return <WeddingInvitation data={invitationRowToWeddingData(row)} invitationSlug={slug} />;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[430px] items-center justify-center bg-white px-7 text-center text-[#332b24]">
      <p className="text-sm leading-7 text-[#7c6e62]">청첩장을 찾을 수 없습니다.</p>
    </main>
  );
}
