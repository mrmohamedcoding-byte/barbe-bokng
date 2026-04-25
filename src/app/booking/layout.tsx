import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book your barbershop appointment in seconds. Choose your service, pick a time, and get instant confirmation.",
  openGraph: {
    title: "Book an Appointment | The Gentleman's Club",
    description:
      "Choose your service, pick a time, and get instant confirmation at The Gentleman's Club.",
    type: "website",
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

