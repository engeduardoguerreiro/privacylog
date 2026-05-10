"use client";

import { useSyncExternalStore } from "react";
import { ShieldAlert } from "lucide-react";

const ageGateStorageKey = "privacylog-age-confirmed-v1";
const ageGateEventName = "privacylog-age-gate";

export default function AgeGate() {
  const confirmed = useSyncExternalStore(
    subscribeAgeGate,
    getAgeGateSnapshot,
    getAgeGateServerSnapshot
  );

  function confirmAge() {
    window.localStorage.setItem(ageGateStorageKey, "confirmed");
    window.dispatchEvent(new Event(ageGateEventName));
  }

  function leaveSite() {
    window.location.href = "https://www.google.com.br";
  }

  if (confirmed) {
    return null;
  }

  return (
    <div className="age-gate-backdrop" role="dialog" aria-modal="true">
      <div className="age-gate-card">
        <span className="privacy-badge badge-alert">
          <ShieldAlert size={14} />
          Acesso restrito
        </span>

        <h2>Site proibido para menores de 18 anos</h2>
        <p>
          O PrivacyLog é destinado exclusivamente a pessoas maiores de idade.
          Ao continuar, você declara ter 18 anos ou mais e concorda em acessar
          conteúdo de caráter adulto com responsabilidade.
        </p>

        <div className="age-gate-actions">
          <button type="button" className="primary-button" onClick={confirmAge}>
            Tenho 18 anos ou mais
          </button>
          <button type="button" className="age-gate-exit" onClick={leaveSite}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

function subscribeAgeGate(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ageGateEventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ageGateEventName, onStoreChange);
  };
}

function getAgeGateSnapshot() {
  return window.localStorage.getItem(ageGateStorageKey) === "confirmed";
}

function getAgeGateServerSnapshot() {
  return false;
}
