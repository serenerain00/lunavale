/**
 * Preview toggle actions. See lib/access/preview.ts for why this is safe.
 *
 * The key is re-validated inside the action rather than trusted because the
 * page rendered a form: a server action is a public endpoint, and anyone can
 * post to it.
 */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  PREVIEW_COOKIE,
  previewCookieValue,
  previewKeyValid,
} from "@/lib/access/preview";
import { getTier } from "@/lib/content/membership";

const EIGHT_HOURS = 60 * 60 * 8;

export async function setPreviewTier(
  key: string | undefined,
  tierId: string,
) {
  if (!previewKeyValid(key)) redirect("/preview");

  const store = await cookies();

  if (tierId === "off" || tierId === "free") {
    store.delete(PREVIEW_COOKIE);
  } else {
    const tier = getTier(tierId);
    if (!tier) redirect("/preview");
    store.set(PREVIEW_COOKIE, previewCookieValue(tier.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // Deliberately short. A preview left on for a week is how you end up
      // reviewing the member experience and calling it the visitor one.
      maxAge: EIGHT_HOURS,
    });
  }

  revalidatePath("/", "layout");
  redirect(key ? `/preview?key=${encodeURIComponent(key)}` : "/preview");
}
