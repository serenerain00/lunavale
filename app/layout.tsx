import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// Display serif for titles; highly readable sans for controls and metadata.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lunavault.com"),
  title: {
    default: "Luna Vault",
    template: "%s · Luna Vault",
  },
  description:
    "An explorable cinematic universe of original stories. Enter the world, discover scenes, and unlock deeper access.",
  openGraph: {
    title: "Luna Vault",
    description:
      "An explorable cinematic universe of original stories.",
    siteName: "Luna Vault",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luna Vault",
    description: "An explorable cinematic universe of original stories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-void text-ivory">
        {children}
      </body>
    </html>
  );
}
