"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SiteHeader from "@/app/_home/SiteHeader";
import SiteFooter from "@/app/_home/SiteFooter";

export default function StudioFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isIndependentClinicPage =
    /^\/studio\/clinicas\/[^/]+(?:\/admin(?:\/.*)?|\/?)?$/.test(pathname);

  if (isIndependentClinicPage) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
