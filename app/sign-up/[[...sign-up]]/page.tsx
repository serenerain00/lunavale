import { SignUp } from "@clerk/nextjs";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <>
      <SiteHeader member={false} />
      <main className="flex flex-1 flex-col items-center px-5 pb-24 pt-16 sm:px-8">
        <h1 className="mb-2 font-display text-3xl font-light text-ivory">
          Create an account.
        </h1>
        <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-stone">
          An account keeps your place in Luna&rsquo;s world. Membership is a
          separate step, and you can stop before it.
        </p>
        <SignUp />
      </main>
    </>
  );
}
