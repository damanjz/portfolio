import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { site, seo } from "@/content";
import { StructuredData } from "./structured-data";
import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import { TransitionLayer } from "@/components/Transition";

// Two families, self-hosted by next/font at build time (no runtime request
// to Google): Archivo for the giant caps, Space Grotesk for everything else.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["800", "900"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: site.metaTitle,
  description: site.metaDescription,
  authors: [{ name: site.name, url: seo.url }],
  creator: site.name,
  keywords: [
    "Daman Reddy",
    "AI-assisted systems developer",
    "3D environment artist",
    "BI analyst",
    "data analyst",
    "Unreal Engine",
    "Blender",
    "Power BI",
    "Tableau",
    "SQL",
    "Rust",
    "Hyderabad",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.metaTitle,
    description: site.metaDescription,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.metaTitle,
    description: site.metaDescription,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${grotesk.variable}`}>
      <body>
        <StructuredData />
        {children}
        <Motion />
        <Cursor />
        <TransitionLayer />
      </body>
    </html>
  );
}
