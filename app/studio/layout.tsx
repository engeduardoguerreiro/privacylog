import type { ReactNode } from "react";
import AgeGate from "@/components/AgeGate";
import StudioFrame from "@/components/studio/StudioFrame";
import { productMetadata } from "@/lib/seo";

export const metadata = productMetadata("studio");

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AgeGate />
      <StudioFrame>{children}</StudioFrame>
    </>
  );
}
