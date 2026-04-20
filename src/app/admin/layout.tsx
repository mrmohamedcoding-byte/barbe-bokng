import type { Metadata } from "next";
import { adminMetadata } from "../layout";

export const metadata: Metadata = {
  ...adminMetadata,
  title: "Login | Admin Portal",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}