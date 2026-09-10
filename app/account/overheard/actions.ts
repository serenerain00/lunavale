"use server";

/**
 * Moderation actions. Owner-only, re-checked here rather than trusted from the
 * page — the page decides what to render, the action decides what may happen.
 */

import { revalidatePath } from "next/cache";
import { isOwner } from "@/lib/access/owner";
import { setHidden } from "@/lib/db/overheard";



export async function toggleHidden(formData: FormData): Promise<void> {
  if (!(await isOwner())) return;
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden") ?? "") === "true";
  if (!/^\d+$/.test(id)) return;
  await setHidden(id, hidden);
  revalidatePath("/account/overheard");
  revalidatePath("/overheard");
}
