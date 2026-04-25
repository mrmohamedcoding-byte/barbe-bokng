import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landing",
  description:
    "A premium barbershop experience with modern precision. Explore our gallery, location, and book your appointment.",
  openGraph: {
    title: "The Gentleman's Club",
    description:
      "Premium barbershop experience. Explore our gallery, location, and book your appointment.",
    type: "website",
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
