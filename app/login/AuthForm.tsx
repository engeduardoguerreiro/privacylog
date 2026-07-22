"use client";

import { useActionState, useState } from "react";
import { Lock, LogIn, Mail, UserPlus } from "lucide-react";
import type { AuthProduct } from "@/lib/auth/product-access";
import { login, signup, type AuthFormState } from "./actions";
import styles from "./auth.module.css";

const initialState: AuthFormState = {};

export default function AuthForm({
  allowSignup = true,
  initialMode = "login",
  nextPath,
  product = "studio",
}: {
  allowSignup?: boolean;
  initialMode?: "login" | "signup";
  nextPath: string;
  product: AuthProduct;
}) {
  const [mode, setMode] = useState<"login" | "signup">(
    allowSignup ? initialMode : "login"
  );
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
    <div>
      {allowSignup ? (
        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`${styles.tab} ${mode === "signup" ? styles.tabActive : ""}`}
          >
            Criar conta
          </button>
        </div>
      ) : null}

      <form
        className={styles.form}
        action={mode === "login" || !allowSignup ? loginAction : signupAction}
      >
        <input type="hidden" name="next" value={nextPath} />
        <input type="hidden" name="product" value={product} />

        <label className={styles.field}>
          <span className={styles.label}>E-mail</span>
          <span className={styles.inputWrap}>
            <Mail size={18} />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@email.com"
              className={styles.input}
            />
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Senha</span>
          <span className={styles.inputWrap}>
            <Lock size={18} />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Sua senha"
              className={styles.input}
            />
          </span>
        </label>

        {state.error ? (
          <div className={`${styles.alert} ${styles.alertError}`}>
            {state.error}
          </div>
        ) : null}

        {state.message ? (
          <div className={`${styles.alert} ${styles.alertOk}`}>
            {state.message}
          </div>
        ) : null}

        <button type="submit" disabled={pending} className={styles.submit}>
          {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
          {pending
            ? "Processando..."
            : mode === "login"
            ? "Entrar"
            : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
