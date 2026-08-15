import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * The site's default share card.
 *
 * There was no og:image at all before this — every link posted anywhere came
 * out as a bare text card. For a project whose audience arrives off
 * thirty-second clips on Instagram, the picture on the card is not decoration,
 * it is the entire first impression.
 *
 * A REAL FRAME, not generated art. The membership page already argues that the
 * promise and the thing being sold should be the same material, and the same
 * applies here: a still from the film says what this is in a way a typographic
 * card never could.
 *
 * The frame is read off the FILESYSTEM rather than fetched over HTTP. This
 * renders during the build, when there is no site to fetch from yet — a
 * self-request would either fail or, worse, quietly fall back and ship a
 * blank card nobody notices until a link is already posted.
 *
 * /public/posters is safe to publish by construction: lib/content/videos.ts
 * guarantees a poster always belongs to the PUBLIC cut. Nothing gated is ever
 * read here.
 */

export const runtime = "nodejs";
export const alt =
  "Luna Vale — an explorable cinematic universe of original stories";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const frame = await readFile(
    path.join(process.cwd(), "public/posters/interview.jpg"),
  );
  const src = `data:image/jpeg;base64,${frame.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0908",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={size.width}
          height={size.height}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Pulled well down so the type sits on near-black rather than on a
            face. Two stops: a soft one across the whole frame, and a heavy
            one under the text. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,9,8,0.97) 0%, rgba(10,9,8,0.82) 34%, rgba(10,9,8,0.30) 68%, rgba(10,9,8,0.12) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          {/* The one amber accent, matching --color-amber in globals.css. */}
          <div
            style={{
              display: "flex",
              width: 64,
              height: 3,
              backgroundColor: "#c98a3e",
              marginBottom: 28,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 78,
              lineHeight: 1.05,
              color: "#f2ece4",
              letterSpacing: "-0.02em",
            }}
          >
            Luna Vale
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 31,
              lineHeight: 1.3,
              color: "#a89f94",
              maxWidth: 880,
            }}
          >
            An explorable cinematic universe of original stories.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
