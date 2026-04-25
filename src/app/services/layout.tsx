import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our premium barbershop services: classic haircuts, skin fades, beard sculpting, hot towel shaves, and VIP packages.",
  openGraph: {
    title: "Services | The Gentleman's Club",
    description:
      "Premium barber services: hair, beard & shave, and VIP packages at The Gentleman's Club.",
    type: "website",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

