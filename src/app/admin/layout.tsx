import type { Metadata } from "next";
import { adminMetadata } from "../layout";

export const metadata: Metadata = {
  ...adminMetadata,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}