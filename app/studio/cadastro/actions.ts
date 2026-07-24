"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBillingPlan, isPurchasable } from "@/lib/billing/plans";
import { ensureProductProfile } from "@/lib/auth/product-access";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = {
  error?: string;
  message?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Garante um slug unico para a nova casa. */
async function uniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  base: string
) {
  const root = slugify(base) || "casa";

  if (!admin) return root;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? root : `${root}-${Math.random().toString(36).slice(2, 6)}`;
    const { data } = await admin
      .from("studio_clinics")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) {
      return candidate;
    }
  }

  return `${root}-${Date.now().toString(36)}`;
}

/**
 * Cadastro da casa assinante: cria a conta, registra a clinica (pendente,
 * vinculada ao dono) com o plano escolhido e leva para o pagamento.
 */
export async function registerClinic(
  _state: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = getString(formData, "clinic_name");
  const city = getString(formData, "city");
  const state = getString(formData, "state");
  const whatsapp = getString(formData, "whatsapp");
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const planSlug = getString(formData, "plan");

  if (!name || !city || !state || !whatsapp) {
    return { error: "Preencha os dados da casa: nome, cidade, estado e WhatsApp." };
  }

  if (!email || !password) {
    return { error: "Informe e-mail e senha para o acesso." };
  }

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const plan = getBillingPlan(planSlug);

  if (!isPurchasable(plan)) {
    return { error: "Escolha um plano valido." };
  }

  const headersList = await headers();
  const clientIp = getClientIp(headersList);
  const limit = checkRateLimit({
    key: `studio-register:${clientIp}:${email.toLowerCase()}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.allowed) {
    return {
      error: `Muitas tentativas de cadastro. Aguarde ${limit.retryAfterSeconds} segundos e tente novamente.`,
    };
  }

  const origin = headersList.get("origin") || "";
  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { product: "studio", clinic_name: name },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(
        "/studio/painel/assinatura"
      )}`,
    },
  });

  if (signUpError || !signUpData.user) {
    return { error: "Nao foi possivel criar a conta agora." };
  }

  // E-mail ja cadastrado: o Supabase devolve um usuario sem identidades.
  if (signUpData.user.identities && signUpData.user.identities.length === 0) {
    return {
      error: "Ja existe uma conta com este e-mail. Faca login para continuar.",
    };
  }

  const admin = createAdminClient();

  if (!admin) {
    return {
      error: "Cadastro indisponivel no momento. Fale com o PrivacyLog.",
    };
  }

  await ensureProductProfile({ product: "studio", supabase, user: signUpData.user });

  const slug = await uniqueSlug(admin, name);

  const { error: clinicError } = await admin.from("studio_clinics").insert({
    owner_id: signUpData.user.id,
    name,
    slug,
    city,
    state: state.toUpperCase().slice(0, 2),
    whatsapp,
    plan: plan.slug,
    status: "pending",
    subscription_status: "none",
    theme: "champagne",
  });

  if (clinicError) {
    console.error("Cadastro: falha ao criar a casa", clinicError);
    return {
      error: "Conta criada, mas houve um erro ao registrar a casa. Fale com o PrivacyLog.",
    };
  }

  // Confirmacao de e-mail desligada: ja ha sessao, segue direto ao pagamento.
  if (signUpData.session) {
    revalidatePath("/", "layout");
    redirect("/studio/painel/assinatura");
  }

  return {
    message:
      "Cadastro criado! Confirme o link enviado para o seu e-mail e, ao entrar, voce sera levado para a escolha do pagamento.",
  };
}
