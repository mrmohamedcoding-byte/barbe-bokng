import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: {
    default: "The Gentleman's Club - Premium Barber",
    template: "%s | The Gentleman's Club",
  },
  description: "Experience the pinnacle of men's grooming and styling. Book your appointment today at The Gentleman's Club.",
  keywords: ["barber", "haircut", "grooming", "men's grooming", "barbershop", "fade", "beard trim"],
  authors: [{ name: "The Gentleman's Club" }],
  openGraph: {
    title: "The Gentleman's Club - Premium Barber",
    description: "Experience the pinnacle of men's grooming and styling.",
    type: "website",
    locale: "en_US",
    siteName: "The Gentleman's Club",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Gentleman's Club - Premium Barber",
    description: "Experience the pinnacle of men's grooming and styling.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Admin pages metadata - noindex for SEO
export const adminMetadata: Metadata = {
  title: "Admin Portal",
  description: "Admin dashboard for The Gentleman's Club",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} bg-neutral-950 text-neutral-50 font-sans antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}