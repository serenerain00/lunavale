/**
 * The win-back email: "Previously on Between Us", what has gone up since this
 * person joined (or left), and one honest way back. Plan and reasoning:
 * docs/retention/WIN_BACK_PLAN.md.
 *
 * PURE, LIKE ./announce.ts — strings in, strings out, no database, no network,
 * no secrets — so scripts/winback.ts can print the exact email it would send.
 *
 * Same refusals as the announcement: no tracking pixel, no click tracking, no
 * urgency, no discount, no "last chance". The access date is stated because it
 * is a fact the reader needs, not as a countdown. Links carry UTM tags, which
 * is first-party attribution through our own cookies and Stripe metadata
 * (docs/analytics/ATTRIBUTION.md) — nothing is reported to anyone but us.
 */

import type { Release } from "@/lib/content/releases";
import { PREVIOUSLY_ON, latestRecapped } from "@/lib/content/recaps";
import { SEASONS } from "@/lib/content/season";

/** Episodes lead the "since" list — see sinceList(). Same set announce.ts uses. */
const EPISODE_HREFS = new Set(
  SEASONS.flatMap((s) => s.episodes.filter((e) => e.slug).map((e) => `/clips/${e.slug}`)),
);

/**
 * "r" is the short renewal note (Melissa, 2026-10-20): members who switched
 * renewal off and whose access ends soon. Group A, but most of them already
 * had the "Previously on" email, so it is its own shorter thing.
 */
export type WinbackGroup = "a" | "b" | "r" | "e";

export interface WinbackPerson {
  firstName?: string;
  /** Group A: when they joined. Group B: when their access ended. */
  since: string;
  /** Group A only: the last day of access. */
  accessUntil?: string;
  /** Group E only: they already got the renewal note (renew-2026-10-20). */
  wroteLastWeek?: boolean;
}

export interface Composed {
  subject: string;
  text: string;
  html: string;
}

export const SUBJECT = "Previously on Between Us";

export function campaignFor(group: WinbackGroup): string {
  if (group === "e") return "ep5-2026-10-23";
  return group === "r" ? "renew-2026-10-20" : `winback-2026-10-${group}`;
}

export const RENEW_SUBJECT = "Before your membership ends";

export const EPISODE_NOTE_SUBJECT = "Episode 5 lands this week";

/**
 * Group "e" (Melissa, 2026-10-23): everyone still inside a cancelled
 * membership. "send out an email to the folks that will expire soon. maybe we
 * can keep them." The news is Episode 5 ("ep 5 lands this week", her words)
 * and the two scenes that went up this week. Short, because nine of them had
 * the renewal note three days earlier and all of them had the digest that
 * morning; the "I know I wrote last week" line only goes to those nine.
 * Same refusals as the rest of this file: no countdown, no discount.
 */
export function composeEpisodeNote(
  person: WinbackPerson,
  base: string,
  unsubscribeUrl: string,
): Composed {
  const u = new URL("/account", base);
  u.searchParams.set("utm_source", "email");
  u.searchParams.set("utm_medium", "winback");
  u.searchParams.set("utm_campaign", campaignFor("e"));
  const actionUrl = u.toString();
  const name = person.firstName?.trim();
  const hi = name ? `Hi ${name.charAt(0).toUpperCase()}${name.slice(1)},` : "Hi,";
  const until = longDate(person.accessUntil ?? person.since);
  const opening =
    `Your Luna Vale membership ends on ${until}.` +
    (person.wroteLastWeek ? " I know I wrote last week, so I'll keep this short." : "");
  const news = "Episode 5 lands this week. And two new scenes went up in the last few days:";
  const scenes = [
    ["Come Home", "a few weeks apart, Luna stops by the farmhouse, and Josh still hasn't accepted she isn't coming home."],
    ["Two in the Morning", "Tyson in the gym, and a call he made from deployment years ago."],
  ];
  const keep = "If you'd like to stay, you can switch renewal back on from your account. Same price, nothing else changes.";
  const ask = "And if you're leaving because something didn't work for you, I'd really like to know. Just reply.";
  const footer = "You're getting this because you're a Luna Vale member.";

  const text = [
    hi, "", opening, "", news, ...scenes.map(([t, d]) => `- ${t}: ${d}`), "",
    keep, `Keep my membership → ${actionUrl}`, "",
    ask, "", "Melissa", "", "—", footer,
    `Stop these emails: ${unsubscribeUrl}`,
    "This does not cancel or change your membership.",
  ].join("\n");

  const p = (s: string) =>
    `<tr><td style="color:#d8d2ca;font-size:15px;line-height:1.7;padding:0 0 18px 0;">${s}</td></tr>`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0908;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
  <tr><td style="color:#c9a227;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding-bottom:22px;">Luna Vale</td></tr>
  ${p(esc(hi))}
  ${p(esc(opening))}
  ${p(esc(news))}
  <tr><td style="color:#d8d2ca;font-size:15px;line-height:1.8;padding:0 0 22px 0;">${scenes
    .map(([t, d]) => `<strong style="color:#f3ede4;">${esc(t)}</strong>: ${esc(d)}`)
    .join("<br>")}</td></tr>
  ${p(esc(keep))}
  <tr><td style="padding:4px 0 26px 0;"><a href="${esc(actionUrl)}" style="display:inline-block;background:#c9a227;color:#0a0908;text-decoration:none;font-size:14px;padding:11px 20px;border-radius:999px;">Keep my membership &rarr;</a></td></tr>
  ${p(esc(ask))}
  ${p("Melissa")}
  <tr><td style="border-top:1px solid #2a2724;padding-top:20px;color:#8b8681;font-size:12px;line-height:1.7;">
    ${esc(footer)}<br>
    <a href="${esc(unsubscribeUrl)}" style="color:#8b8681;">Stop these emails</a> &mdash; it does not cancel or change your membership.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject: EPISODE_NOTE_SUBJECT, text, html };
}

/**
 * The renewal note. Wording approved by Melissa, 2026-10-20. Same refusals as
 * the win-back: the date is stated because it is a fact, not a countdown.
 */
export function composeRenewal(
  person: WinbackPerson,
  releases: Release[],
  base: string,
  unsubscribeUrl: string,
): Composed {
  const u = new URL("/account", base);
  u.searchParams.set("utm_source", "email");
  u.searchParams.set("utm_medium", "winback");
  u.searchParams.set("utm_campaign", campaignFor("r"));
  const actionUrl = u.toString();
  const name = person.firstName?.trim();
  const hi = name ? `Hi ${name.charAt(0).toUpperCase()}${name.slice(1)},` : "Hi,";
  const until = longDate(person.accessUntil ?? person.since);
  const opening = `A quick note: your Luna Vale membership ends on ${until}, and everything stays open until then.`;
  const list = sinceList(releases, person.since);
  const listLines = [
    ...list.scenes.map((r) => r.title),
    ...(list.moreScenes ? [`and ${list.moreScenes} more`] : []),
    ...(list.pages ? [`${list.pages} new ${list.pages === 1 ? "page" : "pages"} of Luna's journal`] : []),
  ];
  const keep = "If you'd like to keep watching, you can switch renewal back on from your account. Same price, nothing else changes.";
  const ask = "If something didn't work for you, just reply. I read every one.";
  const footer = "You're getting this because you're a Luna Vale member.";

  const text = [
    hi, "", opening, "",
    ...(listLines.length ? ["Since you joined:", ...listLines.map((l) => `- ${l}`), ""] : []),
    keep, `Keep my membership → ${actionUrl}`, "",
    ask, "", "Melissa", "", "—", footer,
    `Stop these emails: ${unsubscribeUrl}`,
    "This does not cancel or change your membership.",
  ].join("\n");

  const p = (s: string) =>
    `<tr><td style="color:#d8d2ca;font-size:15px;line-height:1.7;padding:0 0 18px 0;">${s}</td></tr>`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0908;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
  <tr><td style="color:#c9a227;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding-bottom:22px;">Luna Vale</td></tr>
  ${p(esc(hi))}
  ${p(esc(opening))}
  ${
    listLines.length
      ? `<tr><td style="color:#c9a227;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding:0 0 10px 0;">Since you joined</td></tr>
  <tr><td style="color:#d8d2ca;font-size:15px;line-height:1.8;padding:0 0 22px 0;">${listLines.map(esc).join("<br>")}</td></tr>`
      : ""
  }
  ${p(esc(keep))}
  <tr><td style="padding:4px 0 26px 0;"><a href="${esc(actionUrl)}" style="display:inline-block;background:#c9a227;color:#0a0908;text-decoration:none;font-size:14px;padding:11px 20px;border-radius:999px;">Keep my membership &rarr;</a></td></tr>
  ${p(esc(ask))}
  ${p("Melissa")}
  <tr><td style="border-top:1px solid #2a2724;padding-top:20px;color:#8b8681;font-size:12px;line-height:1.7;">
    ${esc(footer)}<br>
    <a href="${esc(unsubscribeUrl)}" style="color:#8b8681;">Stop these emails</a> &mdash; it does not cancel or change your membership.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject: RENEW_SUBJECT, text, html };
}

/** "September 26" — the reader's calendar, not ISO. */
function longDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * What went up after `since`: episodes first, then other scenes, newest first
 * within each, and the journal as a page count — eight lines of handwriting
 * titles would bury the episodes. Trailers are left out (the scene they
 * trail is listed), and posts for the same reason announce.ts leaves them out.
 */
export function sinceList(releases: Release[], since: string, max = 6) {
  const after = releases.filter((r) => r.date > since && r.kind !== "post");
  const scenes = after
    .filter((r) => r.kind === "scene" && !/^Trailer\b/i.test(r.title))
    .sort((a, b) => Number(EPISODE_HREFS.has(b.href)) - Number(EPISODE_HREFS.has(a.href)));
  const pages = after
    .filter((r) => r.kind === "journal")
    .reduce((n, r) => n + (r.pages ?? 1), 0);
  return { scenes: scenes.slice(0, max), moreScenes: Math.max(0, scenes.length - max), pages };
}

export function composeWinback(
  group: WinbackGroup,
  person: WinbackPerson,
  releases: Release[],
  base: string,
  unsubscribeUrl: string,
): Composed {
  const tag = (path: string) => {
    const u = new URL(path, base);
    u.searchParams.set("utm_source", "email");
    u.searchParams.set("utm_medium", "winback");
    u.searchParams.set("utm_campaign", campaignFor(group));
    return u.toString();
  };
  const latest = latestRecapped();
  const watchUrl = tag(`/clips/${latest.slug}`);
  const actionUrl = tag(group === "a" ? "/account" : "/membership");
  const list = sinceList(releases, person.since);
  // People type their names however they type them; "krysta" reads like a
  // form letter. Capitalised, and otherwise left exactly as given.
  const name = person.firstName?.trim();
  const hi = name ? `Hi ${name.charAt(0).toUpperCase()}${name.slice(1)},` : "Hi,";

  const opening =
    group === "a"
      ? `You joined Luna Vale on ${longDate(person.since)}, and I never wrote to tell you what's gone up since. That's on me, so here it is.`
      : `Your Luna Vale membership ended on ${longDate(person.since)}. Since then, the story has kept going, and I wanted you to know where it is.`;
  const listHeading = group === "a" ? "Since you joined:" : "Added since you left:";
  const closing =
    group === "a"
      ? [
          `Your membership ends on ${longDate(person.accessUntil ?? person.since)}, and everything stays open until then. If you'd like to keep watching after that, you can switch renewal back on from your account. Same price, nothing else changes.`,
        ]
      : [`If you'd like to come back, it's the same membership you had, and you can cancel any time.`];
  const actionLabel = group === "a" ? "Keep my membership" : "Come back to Luna Vale";
  const ask =
    group === "a"
      ? "And if something didn't work for you, whether it was too slow, too expensive, or not what you expected, just reply. I read every one, and it changes what I make next."
      : "And if you left because something wasn't right, I'd really like to know. Just reply.";
  const footer =
    group === "a"
      ? "You're getting this because you're a Luna Vale member."
      : "You're getting this because you were a Luna Vale member. I won't write again unless you come back.";

  const listLines = [
    ...list.scenes.map((r) => `- ${r.title}`),
    ...(list.moreScenes ? [`- and ${list.moreScenes} more`] : []),
    ...(list.pages ? [`- ${list.pages} new ${list.pages === 1 ? "page" : "pages"} of Luna's journal`] : []),
  ];

  const text = [
    hi,
    "",
    opening,
    "",
    "PREVIOUSLY ON BETWEEN US",
    "",
    ...PREVIOUSLY_ON.flatMap((r) => [`${r.label}. ${r.text}`, ""]),
    `Watch ${latest.label} → ${watchUrl}`,
    "",
    ...(listLines.length ? [listHeading, ...listLines, ""] : []),
    ...closing,
    `${actionLabel} → ${actionUrl}`,
    "",
    ask,
    "",
    "Melissa",
    "",
    "—",
    footer,
    `Stop these emails: ${unsubscribeUrl}`,
    ...(group === "a" ? ["This does not cancel or change your membership."] : []),
  ].join("\n");

  const p = (s: string, extra = "") =>
    `<tr><td style="color:#d8d2ca;font-size:15px;line-height:1.7;padding:0 0 18px 0;${extra}">${s}</td></tr>`;
  const button = (href: string, label: string) =>
    `<tr><td style="padding:4px 0 26px 0;"><a href="${esc(href)}" style="display:inline-block;background:#c9a227;color:#0a0908;text-decoration:none;font-size:14px;padding:11px 20px;border-radius:999px;">${esc(label)} &rarr;</a></td></tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0908;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
  <tr><td style="color:#c9a227;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding-bottom:22px;">Luna Vale</td></tr>
  ${p(esc(hi))}
  ${p(esc(opening))}
  <tr><td style="color:#f2ece4;font-family:Georgia,serif;font-size:24px;font-weight:300;line-height:1.25;padding:10px 0 18px 0;">Previously on Between Us</td></tr>
  ${PREVIOUSLY_ON.map((r) => p(`<em style="color:#f2ece4;">${esc(r.label)}.</em> ${esc(r.text)}`, "font-family:Georgia,serif;")).join("\n  ")}
  ${button(watchUrl, `Watch ${latest.label}`)}
  ${
    listLines.length
      ? `<tr><td style="color:#c9a227;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding:0 0 10px 0;">${esc(listHeading.replace(/:$/, ""))}</td></tr>
  <tr><td style="color:#d8d2ca;font-size:15px;line-height:1.8;padding:0 0 22px 0;">${listLines.map((l) => esc(l.replace(/^- /, ""))).join("<br>")}</td></tr>`
      : ""
  }
  ${closing.map((c) => p(esc(c))).join("\n  ")}
  ${button(actionUrl, actionLabel)}
  ${p(esc(ask))}
  ${p("Melissa")}
  <tr><td style="border-top:1px solid #2a2724;padding-top:20px;color:#8b8681;font-size:12px;line-height:1.7;">
    ${esc(footer)}<br>
    <a href="${esc(unsubscribeUrl)}" style="color:#8b8681;">Stop these emails</a>${group === "a" ? " &mdash; it does not cancel or change your membership." : ""}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject: SUBJECT, text, html };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
