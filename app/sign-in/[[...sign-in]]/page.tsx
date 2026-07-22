import { SignIn } from "@clerk/nextjs";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <>
      <SiteHeader member={false} />
      <main className="flex flex-1 flex-col items-center px-5 pb-24 pt-16 sm:px-8">
        <h1 className="mb-8 font-display text-3xl font-light text-ivory">
          Welcome back.
        </h1>
        <SignIn />
      </main>
    </>
  );
}
