"use client";

import { useEffect, useSyncExternalStore } from "react";

const cookieKey = "privacylog_cookie_notice";
const cookieEventName = "privacylog_cookie_notice_changed";

export default function CookieBanner() {
  const accepted = useSyncExternalStore(
    subscribeCookieNotice,
    getCookieNoticeSnapshot,
    getCookieNoticeServerSnapshot
  );

  // Marca o body enquanto o aviso ocupa o canto inferior direito,
  // para que o WhatsApp flutuante suba e nao fique coberto.
  useEffect(() => {
    if (accepted) {
      delete document.body.dataset.cookieNotice;
      return;
    }

    document.body.dataset.cookieNotice = "visivel";

    return () => {
      delete document.body.dataset.cookieNotice;
    };
  }, [accepted]);

  if (accepted) {
    return null;
  }

  return (
    <div className="cookie-banner">
      <p>
        Usamos cookies essenciais para manter login, preferências e segurança da
        navegação.
      </p>
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem(cookieKey, "accepted");
          window.dispatchEvent(new Event(cookieEventName));
        }}
      >
        Entendi
      </button>
    </div>
  );
}

function subscribeCookieNotice(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(cookieEventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(cookieEventName, onStoreChange);
  };
}

function getCookieNoticeSnapshot() {
  return window.localStorage.getItem(cookieKey) === "accepted";
}

function getCookieNoticeServerSnapshot() {
  return true;
}
