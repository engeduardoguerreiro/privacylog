"use client";

import { useEffect, type ReactNode } from "react";

type TrackPayload = {
  clinicId: number;
  clinicSlug: string;
  professionalId?: number;
  source?: string;
};

function postEvent(path: string, payload: TrackPayload) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(path, blob);
    return;
  }

  void fetch(path, {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
  });
}

export function StudioPageViewTracker({
  clinicId,
  clinicSlug,
}: {
  clinicId: number;
  clinicSlug: string;
}) {
  useEffect(() => {
    postEvent("/api/studio/analytics/view", { clinicId, clinicSlug, source: "clinic_landing" });
  }, [clinicId, clinicSlug]);

  return null;
}

export function StudioTrackedWhatsAppLink({
  children,
  className,
  clinicId,
  clinicSlug,
  href,
  professionalId,
  source = "clinic_landing",
}: {
  children: ReactNode;
  className?: string;
  clinicId: number;
  clinicSlug: string;
  href: string;
  professionalId?: number;
  source?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => {
        postEvent("/api/studio/analytics/whatsapp-click", {
          clinicId,
          clinicSlug,
          professionalId,
          source,
        });
      }}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
