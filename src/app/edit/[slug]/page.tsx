import { EditInvitation } from "@/components/EditInvitation";
import { getInvitationForEdit, invitationRowToWeddingData } from "@/lib/invitations";

export default async function EditInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string; secret?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const editSecret = query.key ?? query.secret ?? "";
  const row = editSecret ? await getInvitationForEdit(decodeURIComponent(slug), editSecret) : null;

  return (
    <EditInvitation
      slug={decodeURIComponent(slug)}
      initialData={row ? invitationRowToWeddingData(row) : undefined}
      initialEditSecret={editSecret}
      initialLoadMessage={
        editSecret
          ? row
            ? "저장된 청첩장을 불러왔어요. 수정 후 다시 저장할 수 있어요."
            : "편집 링크를 확인하지 못했어요. 주소와 비밀코드를 다시 확인해 주세요."
          : "편집용 비밀코드가 없어요. 고객용 편집 링크 전체로 다시 접속해 주세요."
      }
    />
  );
}
