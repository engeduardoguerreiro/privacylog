export const nicknameCooldownMs = 7 * 24 * 60 * 60 * 1000;

export function getNicknameLockedUntil(changedAt?: string | null) {
  if (!changedAt) {
    return null;
  }

  const changedAtTime = new Date(changedAt).getTime();

  if (Number.isNaN(changedAtTime)) {
    return null;
  }

  return new Date(changedAtTime + nicknameCooldownMs);
}

export function getActiveNicknameLock(changedAt?: string | null) {
  const lockedUntil = getNicknameLockedUntil(changedAt);

  if (!lockedUntil || lockedUntil.getTime() <= Date.now()) {
    return null;
  }

  return lockedUntil.toISOString();
}

export function formatNicknameLockedUntil(lockedUntil: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(lockedUntil));
}
