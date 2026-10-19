/**
 * Said above sign-up and sign-in when the page is open inside Facebook's or
 * Instagram's own browser, where Google sign-in cannot work (lib/access/in-app.ts).
 * The Google button is hidden on those pages; this says why, and how out.
 */
export function InAppNotice({ app }: { app: "facebook" | "instagram" }) {
  const name = app === "facebook" ? "Facebook" : "Instagram";
  return (
    <p className="mb-6 max-w-md rounded-lg border border-amber/30 bg-amber/5 px-4 py-3 text-center text-sm leading-relaxed text-stone">
      You&rsquo;re inside {name}&rsquo;s browser, where Google sign-in doesn&rsquo;t
      work. Use your email address below — or tap <span className="text-ivory">···</span>{" "}
      and choose <span className="text-ivory">Open in browser</span>.
    </p>
  );
}
