"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import {
  formatNicknameLockedUntil,
  getActiveNicknameLock,
} from "./nickname-lock";

export type NicknameFormState = {
  error?: string;
  lockedUntil?: string | null;
  message?: string;
};

const nicknamePattern = /^[A-Za-z0-9_.-]{3,24}$/;

function getCooldownError(lockedUntil: string) {
  return `Você só poderá alterar o nickname novamente em ${formatNicknameLockedUntil(
    lockedUntil
  )}.`;
}

function getLockedUntilFromDatabaseError(error: { details?: string | null }) {
  if (!error.details) {
    return null;
  }

  const lockedUntil = new Date(error.details);

  if (Number.isNaN(lockedUntil.getTime())) {
    return null;
  }

  return lockedUntil.toISOString();
}

export async function updateNickname(
  _state: NicknameFormState,
  formData: FormData
): Promise<NicknameFormState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const rawNickname = formData.get("nickname");
  const nickname = typeof rawNickname === "string" ? rawNickname.trim() : "";

  if (!nicknamePattern.test(nickname)) {
    return {
      error:
        "Use de 3 a 24 caracteres: letras, números, ponto, hífen ou underline.",
    };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, nickname_changed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.nickname === nickname) {
    return { message: "Nickname mantido." };
  }

  const activeLock = getActiveNicknameLock(profile?.nickname_changed_at);

  if (activeLock) {
    return {
      error: getCooldownError(activeLock),
      lockedUntil: activeLock,
    };
  }

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      nickname,
    })
    .select("nickname_changed_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Este nickname já está em uso." };
    }

    if (error.code === "P0001" || error.message === "nickname_cooldown") {
      const lockedUntil = getLockedUntilFromDatabaseError(error);

      return {
        error: lockedUntil
          ? getCooldownError(lockedUntil)
          : "Você só pode alterar o nickname uma vez a cada 7 dias.",
        lockedUntil,
      };
    }

    return { error: "Não foi possível atualizar o nickname agora." };
  }

  const lockedUntil = getActiveNicknameLock(updatedProfile?.nickname_changed_at);

  revalidatePath("/account");
  revalidatePath("/forum", "layout");

  return {
    lockedUntil,
    message: "Nickname atualizado.",
  };
}
