/**
 * The bytes behind a private screening: the film and its poster.
 *
 * Same model as /api/stream: private Blob, a short-lived signed URL minted
 * only after the check passes. The check here is the screening's own — an
 * open row for this token AND the unlock cookie the password set. Membership
 * plays no part. Anything else is a bare 404.
 */

import { cookies } from "next/headers";
import { cookieName, openScreening, unlocked } from "@/lib/db/screenings";
import { blobConfigured, SIGNED_URL_TTL_SECONDS } from "@/lib/media/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOT_FOUND = () =>
  new Response("Not found", {
    status: 404,
    headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" },
  });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; kind: string }> },
) {
  const { token, kind } = await params;
  const s = await openScreening(token);
  if (!s || !unlocked(s, (await cookies()).get(cookieName(s))?.value)) {
    return NOT_FOUND();
  }
  const pathname =
    kind === "video" ? s.blobPath : kind === "poster" ? s.posterPath : null;
  if (!pathname || !blobConfigured()) return NOT_FOUND();

  try {
    const { issueSignedToken, presignUrl } = await import("@vercel/blob");
    const validUntil = Date.now() + SIGNED_URL_TTL_SECONDS * 1000;
    const signed = await issueSignedToken({ pathname, operations: ["get"], validUntil });
    const { presignedUrl } = await presignUrl(signed, {
      operation: "get",
      access: "private",
      pathname,
      validUntil,
    });
    return new Response(null, {
      status: 307,
      headers: {
        Location: presignedUrl,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    console.error("screening: blob lookup failed", error);
    return NOT_FOUND();
  }
}
