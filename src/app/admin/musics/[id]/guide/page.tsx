import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { readGuide } from "@/server/queries/guide";
import { CallGuideEditor } from "@/app/admin/_components/CallGuideEditor";

export const metadata = {
  title: "콜 가이드 편집 | loudasobi",
  robots: { index: false, follow: false },
};
export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/admin");
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const document = await readGuide(Number(id));
  if (!document) notFound();
  return (
    <CallGuideEditor initial={document} readOnly={session.role !== "admin"} />
  );
}
