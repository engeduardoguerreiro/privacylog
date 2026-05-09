export function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function excerpt(texto: string, tamanho = 160) {
  const limpo = texto.replace(/\s+/g, " ").trim();

  if (limpo.length <= tamanho) {
    return limpo;
  }

  return `${limpo.slice(0, tamanho).trim()}...`;
}

export function normalizeSearchQuery(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return (rawValue || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function formatForumDate(value: string | null | undefined) {
  if (!value) {
    return "Agora";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
