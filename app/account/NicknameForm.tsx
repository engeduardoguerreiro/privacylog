"use client";

import { useActionState } from "react";
import { AtSign, Save } from "lucide-react";
import { updateNickname, type NicknameFormState } from "./actions";
import { formatNicknameLockedUntil } from "./nickname-lock";

const initialState: NicknameFormState = {};

export default function NicknameForm({
  currentNickname,
  lockedUntil,
}: {
  currentNickname: string;
  lockedUntil?: string | null;
}) {
  const [state, action, pending] = useActionState(
    updateNickname,
    initialState
  );
  const activeLock = state.lockedUntil ?? lockedUntil;
  const locked = Boolean(activeLock);

  return (
    <form action={action} className="forum-form-card mt-4 p-5">
      <label className="block">
        <span className="mb-2 block text-sm text-[#85859a]">
          Nickname público
        </span>
        <span className="relative block">
          <AtSign
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#85859a]"
          />
          <input
            name="nickname"
            defaultValue={currentNickname}
            disabled={locked}
            minLength={3}
            maxLength={24}
            pattern="[A-Za-z0-9_.-]+"
            required
            className="forum-input pl-11 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </span>
      </label>

      <p className="mt-2 text-xs text-[#85859a]">
        Esse nome aparece nas postagens. Após alterar, só poderá mudar de novo
        depois de 7 dias.
      </p>

      {activeLock ? (
        <div className="mt-4 rounded-md border border-[#f6c453]/40 bg-[#f6c453]/10 px-4 py-3 text-sm text-[#fff0b8]">
          Próxima alteração liberada em{" "}
          <strong>{formatNicknameLockedUntil(activeLock)}</strong>.
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-4 rounded-md border border-[#dc2626]/40 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#ffb4b4]">
          {state.error}
        </div>
      ) : null}

      {state.message ? (
        <div className="mt-4 rounded-md border border-[#50fa7b]/40 bg-[#50fa7b]/10 px-4 py-3 text-sm text-[#b8ffc8]">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending || locked}
        className="primary-button mt-4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save size={17} />
        {pending
          ? "Salvando..."
          : locked
          ? "Nickname bloqueado"
          : "Salvar nickname"}
      </button>
    </form>
  );
}
