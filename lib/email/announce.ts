/**
 * The "there is new material" email, composed from the release feed.
 *
 * DERIVED, LIKE THE RAIL IT MIRRORS. It takes `Release[]` straight from
 * lib/content/releases.ts, so the email cannot announce something that is not
 * really published and cannot miss something that is. The alternative — typing
 * the list into the mail by hand — is how a member ends up clicking a link to
 * a scene that has not shipped.
 *
 * NO SERVER-ONLY IMPORT, ON PURPOSE. Everything here is pure: strings in,
 * strings out, no database, no network, no secrets. That is what lets
 * scripts/announce.ts render the exact email that would be sent without
 * sending it, which is the whole basis of the dry run.
 *
 * WHAT IT DELIBERATELY DOES NOT DO:
 *
 *   No open tracking, no click tracking, no pixel. We would learn very little
 *   and every mail client that blocks them would file us slightly closer to
 *   spam for trying.
 *
 *   No urgency. No "before it's gone", no countdown, nothing expiring. The
 *   material does not expire and CLAUDE.md's rule against fake scarcity does
 *   not stop applying because the medium changed.
 *
 *   No plea. A member who is not watching does not need to be told they are
 *   not watching. The email says what is there and gets out of the way.
 */

import type { Release } from "@/lib/content/releases";
import { formatReleaseDate } from "@/lib/content/releases";

export interface Composed {
  subject: string;
  text: string;
  html: string;
}

/**
 * A stable id for one announcement, so the same one is never sent twice.
 *
 * Built from the dates and hrefs of what it contains rather than from the day
 * it is sent: re-running tomorrow with the same six releases produces the same
 * campaign id and the send is skipped, while one new release makes it a new
 * campaign that goes only to people the old one missed. A timestamp would make
 * every run a new campaign, which is precisely the mistake this prevents.
 */
export function campaignId(releases: Release[]): string {
  const key = releases
    .map((r) => `${r.date}:${r.href}`)
    .sort()
    .join("|");
  // Small, readable, and stable — this is a cache key, not a secret.
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) | 0;
  const newest = releases.map((r) => r.date).sort().at(-1) ?? "none";
  return `release-${newest}-${(h >>> 0).toString(36)}`;
}

function runtime(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.round(seconds / 60);
  return m >= 1 ? ` · ${m} min` : ` · ${seconds}s`;
}

function subjectFor(releases: Release[]): string {
  const scenes = releases.filter((r) => r.kind === "scene").length;
  const pages = releases.filter((r) => r.kind === "journal").length;

  // Named, when there is one thing. A specific title outperforms a count, and
  // more to the point it is the honest subject line: this email is about that
  // scene.
  if (releases.length === 1) {
    const only = releases[0];
    return only.kind === "scene"
      ? `New on Luna Vale: ${only.title}`
      : `Luna wrote something new`;
  }

  const parts: string[] = [];
  if (scenes) parts.push(`${scenes} new ${scenes === 1 ? "scene" : "scenes"}`);
  if (pages) parts.push(`${pages} new journal ${pages === 1 ? "page" : "pages"}`);
  return `New on Luna Vale: ${parts.join(" and ")}`;
}

/**
 * Compose the email.
 *
 * `base` is the site URL every link is built against, and `unsubscribeUrl` is
 * this recipient's own signed link — the two are passed in rather than read
 * from the environment so that the dry run renders exactly what a real send
 * would, against the same host.
 */
export function compose(
  releases: Release[],
  base: string,
  unsubscribeUrl: string,
  options: { shown?: number; countedFrom?: string } = {},
): Composed {
  const url = (href: string) => new URL(href, base).toString();

  // THE CAP IS THE POINT. Fourteen days of this site is routinely thirty
  // items, because the journal goes up in handfuls. Thirty entries in an email
  // is not generosity, it is a wall that gets scrolled past — and worse, it
  // makes the newest thing look like one of thirty rather than the thing that
  // just landed. So the mail shows the top few in release order and tells the
  // truth about the rest, with somewhere to go and read it.
  //
  // SCENES FIRST, THEN PAGES, rather than strict release order. The feed on the
  // site is chronological because a visitor is browsing; an email is a pitch
  // for one visit, and on a day when one scene and six journal pages went up,
  // strict order buries the scene under six lines of handwriting. Within each
  // kind it is still newest first, so nothing is reordered to flatter it.
  const shown = options.shown ?? 8;
  const scenes = releases.filter((r) => r.kind === "scene");
  const pages = releases.filter((r) => r.kind !== "scene");
  const listedScenes = scenes.slice(0, Math.min(shown, Math.max(4, shown - 3)));
  const listedPages = pages.slice(0, Math.max(0, shown - listedScenes.length));
  const listed = [...listedScenes, ...listedPages];
  const extra = releases.length - listed.length;
  const moreText =
    extra > 0
      ? `and ${extra} more since ${formatReleaseDate(options.countedFrom ?? releases.at(-1)!.date)} — ${url("/browse")}`
      : null;

  /** One release, as four plain-text lines and a blank. */
  const asText = (r: Release): string[] => [
    `${r.title}${runtime(r.durationSeconds)}`,
    `${formatReleaseDate(r.date)} · ${r.access === "free" ? "Open to everyone" : "Members"}`,
    r.blurb,
    url(r.href),
    "",
  ];

  /** A heading and its items, or nothing at all when there are none. */
  const textSection = (heading: string, items: Release[]): string[] =>
    items.length ? [heading.toUpperCase(), "", ...items.flatMap(asText)] : [];

  const textLines = [
    "There's new material on Luna Vale.",
    "",
    ...textSection("Scenes", listedScenes),
    ...textSection("From her journal", listedPages),
    ...(moreText ? [moreText, ""] : []),
    "—",
    "Melissa",
    "",
    `You're getting this because you're a Luna Vale member.`,
    `Stop these emails: ${unsubscribeUrl}`,
    `This does not cancel your membership.`,
  ];

  const asRow = (r: Release) => `
      <tr><td style="padding:0 0 28px 0;">
        <a href="${url(r.href)}" style="color:#f2ece4;text-decoration:none;font-size:18px;font-family:Georgia,serif;">${esc(r.title)}</a>
        <div style="color:#8b8681;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:6px 0 8px 0;">
          ${esc(formatReleaseDate(r.date))}${r.durationSeconds ? ` &middot; ${Math.round(r.durationSeconds / 60)} min` : ""} &middot; ${r.access === "free" ? "Open to everyone" : "Members"}
        </div>
        <div style="color:#a8a29b;font-size:14px;line-height:1.6;">${esc(r.blurb)}</div>
      </td></tr>`;

  const htmlSection = (heading: string, items: Release[]) =>
    items.length
      ? `<tr><td style="color:#c9a227;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding:0 0 14px 0;">${esc(heading)}</td></tr>` +
        items.map(asRow).join("")
      : "";

  const htmlItems =
    htmlSection("Scenes", listedScenes) +
    htmlSection("From her journal", listedPages);

  // Table layout and inline styles throughout, because that is what mail
  // clients render. No external stylesheet, no web font, no image — the last
  // one on purpose: an email whose meaning depends on a picture says nothing
  // at all in the many clients that block them by default.
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0908;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
  <tr><td style="color:#c9a227;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding-bottom:12px;">Luna Vale</td></tr>
  <tr><td style="color:#f2ece4;font-family:Georgia,serif;font-size:26px;font-weight:300;line-height:1.2;padding-bottom:28px;">There&rsquo;s new material.</td></tr>
  ${htmlItems}
  ${
    extra > 0
      ? `<tr><td style="padding:0 0 28px 0;"><a href="${esc(url("/browse"))}" style="color:#c9a227;font-size:14px;text-decoration:none;">and ${extra} more since ${esc(formatReleaseDate(options.countedFrom ?? releases.at(-1)!.date))} &rarr;</a></td></tr>`
      : ""
  }
  <tr><td style="border-top:1px solid #2a2724;padding-top:20px;color:#8b8681;font-size:12px;line-height:1.7;">
    You&rsquo;re getting this because you&rsquo;re a Luna Vale member.<br>
    <a href="${esc(unsubscribeUrl)}" style="color:#8b8681;">Stop these emails</a> &mdash; it does not cancel your membership.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject: subjectFor(releases), text: textLines.join("\n"), html };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
