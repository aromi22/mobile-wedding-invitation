import { WeddingInvitation } from "@/components/WeddingInvitation";
import { wedding } from "@/data/wedding";

export default function Home() {
  return <WeddingInvitation data={wedding} />;
}
