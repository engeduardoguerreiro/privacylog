"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ensureProductProfile,
  getAuthProductFromPath,
  getProductLabel,
  hasProductAccess,
  normalizeAuthProduct,
} from "@/lib/auth/product-access";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getSafeNextPath(formData: FormData) {
  const next = getString(formData, "next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

function getRequestedProduct(formData: FormData) {
  return normalizeAuthProduct(
    formData.get("product"),
    getAuthProductFromPath(getSafeNextPath(formData))
  );
}

export async function login(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const product = getRequestedProduct(formData);
  const headersList = await headers();
  const clientIp = getClientIp(headersList);

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const loginLimit = checkRateLimit({
    key: `${product}-login:${clientIp}:${email.toLowerCase()}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!loginLimit.allowed) {
    return {
      error: `Muitas tentativas. Aguarde ${loginLimit.retryAfterSeconds} segundos e tente novamente.`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "E-mail ou senha invalidos." };
  }

  const allowed = await hasProductAccess(supabase, data.user, product);

  if (!allowed) {
    await supabase.auth.signOut();

    return {
      error: `Este login nao possui acesso ao ${getProductLabel(
        product
      )}. Use a conta correta ou crie um cadastro especifico para este produto.`,
    };
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
  const product = getRequestedProduct(formData);
  const headersList = await headers();
  const clientIp = getClientIp(headersList);

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const signupLimit = checkRateLimit({
    key: `${product}-signup:${clientIp}:${email.toLowerCase()}`,
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

  const origin = headersList.get("origin") || "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        product,
      },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(
        getSafeNextPath(formData)
      )}`,
    },
  });

  if (error) {
    return { error: "Nao foi poss?vel criar a conta agora." };
  }

  if (data.user) {
    await ensureProductProfile({
      product,
      supabase,
      user: data.user,
    });
  }

  return {
    message: `Cadastro criado para ${getProductLabel(
      product
    )}. Se a confirmacao por e-mail estiver ativa, confirme o link antes de entrar.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
