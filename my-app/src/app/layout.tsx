import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";
import ActiveSectionContextProvider from "../../context/active-section";
import ToasterProvider from "../components/ToasterProvider";
import AnimatedBackground from "../components/AnimatedBackground";


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
  title: "Achraf BOUGATTAYA | Personal Portfolio",
  description: "Achraf is a front-end developer with 4+ years of experience specializing in React,Node.js, Next.js, and modern web technologies.",
  keywords: ["Achraf BOUGATTAYA", "Front-end Developer", "React Developer", "Next.js","Node.js", "Web Developer", "Portfolio"],
  authors: [{ name: "Achraf BOUGATTAYA" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://achrafbougattaya.com",
    title: "Achraf BOUGATTAYA | Personal Portfolio",
    description: "Front-end developer with 3 years of experience specializing in React, Next.js, and modern web technologies.",
    siteName: "Achraf BOUGATTAYA Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Achraf BOUGATTAYA | Personal Portfolio",
    description: "Front-end developer with 3 years of experience specializing in React, Next.js, and modern web technologies.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
    <html lang="en" className="!scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-950 pt-28 sm:pt-36`}
      >
        <AnimatedBackground />
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:bg-gray-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
        >
          Skip to main content
        </a>
        <ActiveSectionContextProvider>
          <Header/>
          {children}
        </ActiveSectionContextProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
