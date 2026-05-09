"use client";

import { useActionState, useState } from "react";
import { AtSign, Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { login, signup, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export default function AuthForm({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialState
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialState
  );
  const pending = loginPending || signupPending;
  const state = mode === "login" ? loginState : signupState;

  return (
    <div className="forum-form-card p-6 shadow-2xl shadow-black/30">
      <div className="mb-6 grid grid-cols-2 rounded-lg border border-[#2d2d44] bg-[#090912] p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-md px-4 py-3 text-sm font-bold transition ${
            mode === "login"
              ? "bg-[#f6c453] text-black"
              : "text-[#b8b8c8] hover:text-white"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-md px-4 py-3 text-sm font-bold transition ${
            mode === "signup"
              ? "bg-[#f6c453] text-black"
              : "text-[#b8b8c8] hover:text-white"
          }`}
        >
          Criar conta
        </button>
      </div>

      <form action={mode === "login" ? loginAction : signupAction}>
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
              E-mail
            </span>
            <span className="relative block">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#85859a]"
              />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@email.com"
                className="forum-input pl-11"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
              Senha
            </span>
            <span className="relative block">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#85859a]"
              />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="Sua senha"
                className="forum-input pl-11"
              />
            </span>
          </label>

          {mode === "signup" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
                Nickname público
              </span>
              <span className="relative block">
                <AtSign
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#85859a]"
                />
                <input
                  name="nickname"
                  type="text"
                  required
                  minLength={3}
                  maxLength={24}
                  pattern="[A-Za-z0-9_.-]+"
                  autoComplete="nickname"
                  placeholder="seu_nick"
                  className="forum-input pl-11"
                />
              </span>
              <span className="mt-2 block text-xs text-[#85859a]">
                Aparece nas postagens; seu e-mail fica privado.
              </span>
            </label>
          ) : null}

          {state.error ? (
            <div className="rounded-md border border-[#dc2626]/40 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#ffb4b4]">
              {state.error}
            </div>
          ) : null}

          {state.message ? (
            <div className="rounded-md border border-[#50fa7b]/40 bg-[#50fa7b]/10 px-4 py-3 text-sm text-[#b8ffc8]">
              {state.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {pending
              ? "Processando..."
              : mode === "login"
              ? "Entrar"
              : "Criar conta"}
          </button>
        </div>
      </form>
    </div>
  );
}
