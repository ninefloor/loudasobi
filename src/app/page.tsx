import { AppFrame } from "@/components/layout/AppFrame";
import { connection } from "next/server";
import { getPublicCatalog } from "@/server/queries/catalog";
import { readSidebarLayout } from "@/server/queries/sidebar";
import { projectSidebar } from "@/lib/sidebarOrder";

export default async function Home() {
  await connection();
  const result = await Promise.all([
    getPublicCatalog(),
    readSidebarLayout(),
  ]).catch(() => null);
  const catalog = result?.[0] ?? [];
  const layout = projectSidebar(
    result?.[1] ?? { groups: [], ungrouped: [] },
    catalog.map((entry) => entry.music.id),
  );
  // Never send hidden-song IDs or empty/private-only group names to the public client.
  layout.groups = layout.groups.filter((group) => group.musicIds.length);
  return (
    <AppFrame
      catalog={catalog}
      sidebarLayout={layout}
      unavailable={result === null}
    />
  );
}
