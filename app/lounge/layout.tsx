import type { ReactNode } from "react";
import { productMetadata } from "@/lib/seo";

export const metadata = productMetadata("lounge");

export default function LoungeLayout({ children }: { children: ReactNode }) {
  return children;
}
