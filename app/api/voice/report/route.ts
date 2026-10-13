/**
 * The detail behind a spoken answer, for the report panel on /admin/voice.
 *
 * When the assistant offers "want that on screen?" and Melissa says yes, the
 * agent fires the `show_report` client tool; the page then fetches the report
 * HERE, as her, through the owner gate. The numbers come from the same
 * functions the webhook tools use, so screen and voice agree.
 */

import { isOwner, notOwner } from "@/lib/access/owner";
import { businessSnapshot, type Range } from "@/lib/marketing/snapshot";
import { contentInventory } from "@/lib/marketing/content";
import { instagramStats } from "@/lib/marketing/instagram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isOwner())) return notOwner();
  const url = new URL(req.url);
  const name = url.searchParams.get("name");
  const range = (["today", "week", "month"] as Range[]).find((r) => r === url.searchParams.get("range")) ?? "week";
  if (name === "snapshot") return Response.json(await businessSnapshot(range));
  if (name === "content") return Response.json(contentInventory());
  if (name === "instagram") {
    const post = url.searchParams.get("post")?.slice(0, 80) || undefined;
    const days = Number(url.searchParams.get("days")) || undefined;
    return Response.json(await instagramStats({ post, days }));
  }
  return new Response("Not found", { status: 404 });
}
