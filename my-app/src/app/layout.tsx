import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";
import ActiveSectionContextProvider from "../../context/active-section";
import FocusContextProvider from "../../context/focus";
import RoomContextProvider from "../../context/room";
import ToasterProvider from "../components/ToasterProvider";
import AnimatedBackground from "../components/AnimatedBackground";
import { KNOWS_ABOUT, SITE, SITE_URL, SOCIAL } from "../../lib/site";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  // Every relative URL below (canonical, share image...) is resolved against the real site address.
  metadataBase: new URL(SITE_URL),
  title: SITE.title,
  description: SITE.description,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: SITE.title,
    description: SITE.shortDescription,
    siteName: `${SITE.name} Portfolio`,
    // the image comes from src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.shortDescription,
    // the image comes from src/app/twitter-image.tsx
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Structured data: tells search engines who this site is about.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: SITE.role,
  url: SITE_URL,
  image: `${SITE_URL}/me.png`,
  description: SITE.shortDescription,
  sameAs: [SOCIAL.linkedin, SOCIAL.github],
  knowsAbout: [...KNOWS_ABOUT],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the inline script below adds the "js" class before React hydrates
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-950 pt-28 sm:pt-36`}
      >
        {/* Marks that JavaScript runs, before the first paint: lets the explorer cards hide until their entrance. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script
          type="application/ld+json"
          // "<" is escaped so the data can never close the script tag early
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <AnimatedBackground />
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:bg-gray-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
        >
          Skip to main content
        </a>
        <ActiveSectionContextProvider>
          <FocusContextProvider>
            <RoomContextProvider>
              <Header/>
              {children}
            </RoomContextProvider>
          </FocusContextProvider>
        </ActiveSectionContextProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
