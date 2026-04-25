"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { Scissors, CalendarClock, Users, Store, SlidersHorizontal } from "lucide-react";

const cards = [
  {
    title: "Services & Pricing",
    desc: "Add/edit services, pricing, duration, and active status.",
    href: "/admin/settings/services",
    icon: Scissors,
  },
  {
    title: "Schedule",
    desc: "Working hours, days off, and blocked dates (holidays).",
    href: "/admin/settings/schedule",
    icon: CalendarClock,
  },
  {
    title: "Barbers",
    desc: "Manage barbers, photos, and service assignment.",
    href: "/admin/settings/barbers",
    icon: Users,
  },
  {
    title: "Shop Settings",
    desc: "Shop name, phone, address, social links, and logo.",
    href: "/admin/settings/shop",
    icon: Store,
  },
  {
    title: "Booking Settings",
    desc: "Max bookings per slot, booking window, auto-confirm, policy text.",
    href: "/admin/settings/booking",
    icon: SlidersHorizontal,
  },
] as const;

export default function AdminSettingsHome() {
  return (
    <div className="bg-neutral-950">
      <FadeIn>
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-white">Settings</h1>
          <p className="text-neutral-400 mt-2">Configure services, schedule, barbers, and shop preferences.</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c, idx) => (
          <FadeIn key={c.href} delay={idx * 0.05} className="bg-neutral-900 border border-white/5 rounded-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-neutral-950 border border-white/10 rounded-sm flex items-center justify-center">
                <c.icon className="w-5 h-5 text-gold-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-white font-bold">{c.title}</h2>
                <p className="text-neutral-400 text-sm mt-1">{c.desc}</p>
                <div className="mt-4">
                  <Link
                    href={c.href}
                    className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-400 text-neutral-950 px-4 py-2 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

