import type { Metadata } from "next";

import "./globals.css";

const siteName = "Section 174 Tracker";
const siteDescription =
  "Track Section 174 restoration bills, monitor congressional movement in real time, and model your tax cash-flow impact.";
const baseUrl = process.env.APP_BASE_URL ?? "https://section174tracker.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${siteName} | Legislative & Tax Impact Dashboard`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "section 174",
    "software tax deduction",
    "R&D amortization",
    "tax tool for developers",
    "congress bill tracking",
  ],
  openGraph: {
    title: `${siteName} | Legislative & Tax Impact Dashboard`,
    description: siteDescription,
    type: "website",
    siteName,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Legislative & Tax Impact Dashboard`,
    description: siteDescription,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d1117] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
