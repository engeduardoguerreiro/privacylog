/**
 * Temas da pagina publica da clinica.
 *
 * A estrutura e o layout sao sempre os do PrivacyLog: o tema muda apenas a
 * cor de acento e o tom do fundo/superficie. Todos sao claros, por decisao
 * de identidade do produto.
 */

export type ClinicThemeSlug =
  | "champagne"
  | "bordo"
  | "esmeralda"
  | "ametista"
  | "grafite";

export type ClinicTheme = {
  slug: ClinicThemeSlug;
  name: string;
  description: string;
  /** cor principal (botoes, titulos de destaque, detalhes) */
  accent: string;
  /** versao mais escura do acento, para texto sobre fundo claro */
  accentStrong: string;
  /** fundo da pagina */
  background: string;
  /** cartoes e blocos */
  surface: string;
  /** linhas e bordas */
  line: string;
  /** texto principal */
  ink: string;
  /** texto de apoio */
  muted: string;
};

export const clinicThemes: ClinicTheme[] = [
  {
    slug: "champagne",
    name: "Champagne",
    description: "O padrão PrivacyLog: creme quente com dourado discreto.",
    accent: "#C9AE7C",
    accentStrong: "#A5813C",
    background: "#F4EFE7",
    surface: "#FBF8F1",
    line: "#E6DECF",
    ink: "#17130F",
    muted: "#8A8076",
  },
  {
    slug: "bordo",
    name: "Bordô",
    description: "Vinho profundo sobre rosado quente. Clima intimista.",
    accent: "#8C3448",
    accentStrong: "#6E2739",
    background: "#F7EFEF",
    surface: "#FDF7F7",
    line: "#EBDADA",
    ink: "#1E1214",
    muted: "#8A7276",
  },
  {
    slug: "esmeralda",
    name: "Esmeralda",
    description: "Verde sóbrio com fundo fresco. Ar de bem-estar e spa.",
    accent: "#2A8564",
    accentStrong: "#1E6B4F",
    background: "#EFF4F1",
    surface: "#F8FBF9",
    line: "#D9E5DE",
    ink: "#121A16",
    muted: "#6F7F77",
  },
  {
    slug: "ametista",
    name: "Ametista",
    description: "Roxo elegante em base lilás suave. Mais autoral.",
    accent: "#7E4A87",
    accentStrong: "#5F3468",
    background: "#F3EFF6",
    surface: "#FAF7FC",
    line: "#E3DAE8",
    ink: "#171220",
    muted: "#7C7186",
  },
  {
    slug: "grafite",
    name: "Grafite",
    description: "Neutro e minimalista. Deixa as fotos falarem.",
    accent: "#4C5A63",
    accentStrong: "#36434B",
    background: "#F1F2F3",
    surface: "#FAFAFB",
    line: "#DEE1E3",
    ink: "#14181B",
    muted: "#737C82",
  },
];

export const defaultClinicTheme = clinicThemes[0];

export function getClinicTheme(slug: unknown): ClinicTheme {
  const found = clinicThemes.find((theme) => theme.slug === slug);
  return found || defaultClinicTheme;
}

/** Variaveis CSS aplicadas no container da pagina da clinica. */
export function clinicThemeVars(theme: ClinicTheme) {
  return {
    "--ct-accent": theme.accent,
    "--ct-accent-strong": theme.accentStrong,
    "--ct-bg": theme.background,
    "--ct-surface": theme.surface,
    "--ct-line": theme.line,
    "--ct-ink": theme.ink,
    "--ct-muted": theme.muted,
  } as React.CSSProperties;
}
