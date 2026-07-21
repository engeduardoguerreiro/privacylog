"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import StudioFooter from "./StudioFooter";
import StudioHeader from "./StudioHeader";

export default function StudioFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isIndependentClinicPage =
    /^\/studio\/clinicas\/[^/]+(?:\/admin(?:\/.*)?|\/?)?$/.test(pathname);

  if (isIndependentClinicPage) {
    return <>{children}</>;
  }

  return (
    <>
      <StudioHeader />
      {children}
      <StudioFooter />
    </>
  );
}
