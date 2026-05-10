"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

const nicknamePattern = /^[A-Za-z0-9_.-]{3,24}$/;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getSafeNextPath(formData: FormData) {
  const next = getString(formData, "next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/account";
  }

  return next;
}

export async function login(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const headersList = await headers();
  const clientIp = getClientIp(headersList);

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const loginLimit = checkRateLimit({
    key: `login:${clientIp}:${email.toLowerCase()}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!loginLimit.allowed) {
    return {
      error: `Muitas tentativas. Aguarde ${loginLimit.retryAfterSeconds} segundos e tente novamente.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  revalidatePath("/", "layout");
  redirect(getSafeNextPath(formData));
}

export async function signup(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const nickname = getString(formData, "nickname");
  const headersList = await headers();
  const clientIp = getClientIp(headersList);

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const signupLimit = checkRateLimit({
    key: `signup:${clientIp}:${email.toLowerCase()}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });

  if (!signupLimit.allowed) {
    return {
      error: `Muitas tentativas de cadastro. Aguarde ${signupLimit.retryAfterSeconds} segundos e tente novamente.`,
    };
  }

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  if (!nicknamePattern.test(nickname)) {
    return {
      error:
        "Use um nickname de 3 a 24 caracteres com letras, números, ponto, hífen ou underline.",
    };
  }

  const origin = headersList.get("origin") || "";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
      },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return { error: "Não foi possível criar a conta agora." };
  }

  return {
    message:
      "Conta criada. Se a confirmação por e-mail estiver ativa, confirme o link antes de entrar.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
