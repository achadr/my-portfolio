import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";
import ActiveSectionContextProvider from "../../context/active-section";
import ToasterProvider from "../components/ToasterProvider";


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
  description: "Achraf is a front-end developer with 3 years of experience specializing in React, Next.js, and modern web technologies.",
  keywords: ["Achraf BOUGATTAYA", "Front-end Developer", "React Developer", "Next.js", "Web Developer", "Portfolio"],
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
        <div className="bg-[#fbe2e3] absolute -z-10 top-[-1rem] right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem]"></div>
        <div className="bg-[#dbd7fb] absolute -z-10 top-[-6rem] left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem]"></div>
        <ActiveSectionContextProvider>
          <Header/>
          {children}
        </ActiveSectionContextProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
