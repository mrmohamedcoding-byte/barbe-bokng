import type { Metadata } from "next";
import { adminMetadata } from "../layout";
import Link from "next/link";
import { Calendar, Settings, ScrollText } from "lucide-react";

export const metadata: Metadata = {
  ...adminMetadata,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-grow bg-neutral-950">
      <div className="container mx-auto max-w-7xl w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <div className="bg-neutral-900 border border-white/5 rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-white font-bold uppercase tracking-widest text-sm">Admin</p>
                <p className="text-neutral-500 text-xs mt-1">Manage bookings & settings</p>
              </div>

              <nav className="p-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-gold-500" />
                  <span className="font-semibold">Dashboard</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gold-500" />
                  <span className="font-semibold">Settings</span>
                </Link>
                <Link
                  href="/admin/audit-log"
                  className="flex items-center gap-3 px-4 py-3 rounded-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ScrollText className="w-4 h-4 text-gold-500" />
                  <span className="font-semibold">Audit Log</span>
                </Link>
              </nav>
            </div>
          </aside>

          <section className="lg:col-span-9">{children}</section>
        </div>
      </div>
    </div>
  );
}