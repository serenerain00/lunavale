"use server";

/**
 * Recording a survey answer.
 *
 * NO ACCOUNT REQUIRED, which is the whole point — see lib/content/survey.ts.
 * That makes spam the trade, handled the way the help form handles it: a
 * honeypot and hard limits rather than a captcha, which taxes every honest
 * answer to solve a problem this traffic does not have yet.
 *
 * EVERY ANSWER IS VALIDATED AGAINST THE QUESTIONS. A server action is a public
 * endpoint; anybody can post anything to it. Options that are not on the list
 * are dropped rather than stored, because the only thing worse than a small
 * sample is a small sample with invented rows in it that Melissa then makes a
 * decision on.
 */

import { cookies } from "next/headers";
import {
  ANSWERED_COOKIE,
  MAX_COMMENT,
  isValidOption,
  questions,
} from "@/lib/content/survey";
import { addSurveyResponse, databaseConfigured } from "@/lib/db/survey";
import { authConfigured } from "@/lib/billing/provider";

export interface SurveyResult {
  ok: boolean;
  error?: string;
}

const ONE_YEAR = 60 * 60 * 24 * 365;

function token(): string {
  return crypto.randomUUID();
}

export async function submitSurvey(
  formData: FormData,
): Promise<SurveyResult> {
  if (!databaseConfigured()) {
    return { ok: false, error: "Answers aren't reaching us right now." };
  }

  // Honeypot: hidden from people and from screen readers; bots fill it.
  // Reports success — telling a bot it was caught only teaches it to retry.
  if (String(formData.get("website") ?? "").trim()) return { ok: true };

  const single = (id: string): string | null => {
    const v = String(formData.get(id) ?? "").trim();
    return v && isValidOption(id, v) ? v : null;
  };

  const enjoyment = single("enjoyment");
  const format = single("format");
  const wouldWatch = single("would_watch");

  // The three required ones, named individually so the message can say which.
  const missing = questions
    .filter((q) => q.required)
    .find(
      (q) =>
        (q.id === "enjoyment" && !enjoyment) ||
        (q.id === "format" && !format) ||
        (q.id === "would_watch" && !wouldWatch),
    );
  if (missing || !enjoyment || !format || !wouldWatch) {
    return {
      ok: false,
      error: missing
        ? `One still to go: ${missing.prompt}`
        : "Something in there didn't look right.",
    };
  }

  const favouriteScene = single("favourite_scene");
  const wants = formData
    .getAll("wants")
    .map((v) => String(v))
    .filter((v) => isValidOption("wants", v));

  let comment: string | null = String(formData.get("comment") ?? "").trim();
  if (comment.length > MAX_COMMENT) {
    return { ok: false, error: `That's longer than ${MAX_COMMENT} characters.` };
  }
  if (!comment) comment = null;

  const jar = await cookies();
  const clientToken = jar.get(ANSWERED_COOKIE)?.value || token();

  let userId: string | null = null;
  if (authConfigured()) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      userId = (await auth()).userId ?? null;
    } catch {
      // Signed out, or Clerk unreachable. The answer still counts — an
      // identity is a nice-to-have here, never a requirement.
      userId = null;
    }
  }

  try {
    await addSurveyResponse({
      enjoyment,
      format,
      wouldWatch,
      favouriteScene,
      wants,
      comment,
      userId,
      clientToken,
    });
  } catch {
    return { ok: false, error: "That didn't save. Try once more?" };
  }

  jar.set(ANSWERED_COOKIE, clientToken, {
    maxAge: ONE_YEAR,
    sameSite: "lax",
    path: "/",
  });

  return { ok: true };
}
