/**
 * Mints a short-lived client token so the browser uploads STRAIGHT TO BLOB.
 *
 * WHY THIS EXISTS, AND IT IS NOT A MICRO-OPTIMISATION. The first version of
 * Studio POSTed the file to /api/studio/refs as multipart and the function
 * wrote it to Blob. That works locally and dies in production: the request has
 * to fit through a serverless function's body limit, and a normal reference
 * photo does not. The failure is a bare 413 from the platform BEFORE any of
 * our code runs, so the route's own friendly size message never gets a chance
 * to be wrong or right.
 *
 * Client uploads remove the function from the data path entirely. The bytes go
 * browser → Blob; the only thing that passes through here is a token.
 *
 * THE GATE IS STILL SERVER-SIDE, and it is in onBeforeGenerateToken, which runs
 * here before any token exists. A token is minted only for the owner, only for
 * an image content type, only under studio/refs/, and only up to the same cap
 * the old route enforced — so the limits did not move to the client, they moved
 * into the token.
 *
 * PRIVATE, like everything else in this folder. A client upload is not a public
 * one; `access: "private"` is set on the browser call and the blob is reachable
 * only through /api/studio/refs/[id], behind the same owner check.
 *
 * ONUPLOADCOMPLETED IS DELIBERATELY A NO-OP. Blob calls it by webhook, which
 * cannot reach localhost, so relying on it would make the library work in
 * production and silently not in development. The row is written instead by the
 * browser POSTing metadata to /api/studio/refs once the upload resolves — a few
 * hundred bytes of JSON, which fits through a function very comfortably.
 */

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isOwner, notOwner } from "@/lib/access/owner";
import { MAX_REF_BYTES } from "@/lib/studio/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isOwner())) return notOwner();

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        // Checked again here rather than trusted from above: this callback is
        // the only thing standing between a request and a write token.
        if (!(await isOwner())) throw new Error("Not the owner.");
        if (!pathname.startsWith("studio/refs/")) {
          throw new Error("Studio uploads live under studio/refs/.");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
          ],
          maximumSizeInBytes: MAX_REF_BYTES,
          // The id is minted by the browser and IS the filename, so a random
          // suffix would break the /api/studio/refs/[id] lookup.
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
      onUploadCompleted: async () => {
        // See the note above — the row is written by the browser instead.
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload refused." },
      { status: 400 },
    );
  }
}
