export type ForumCategory = {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  parent_id: number | null;
  estado: string | null;
  tipo: string | null;
  clinic_id: number | null;
  created_at?: string | null;
  topic_count?: number;
  reply_count?: number;
  child_count?: number;
  last_activity_at?: string | null;
};

export type ForumTopic = {
  id: number;
  titulo: string;
  slug: string;
  conteudo: string;
  category_id: number | null;
  clinic_id: number | null;
  user_id: string | null;
  autor: string | null;
  nota: number | null;
  fixado: boolean | null;
  trancado: boolean | null;
  oculto: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  views: number | null;
  pinned: boolean | null;
  locked: boolean | null;
  forum_categories?: {
    id?: number;
    nome: string;
    slug?: string;
    parent_id?: number | null;
    estado?: string | null;
    tipo?: string | null;
    clinic_id?: number | null;
  } | null;
  reply_count?: number;
  last_reply_at?: string | null;
  author_nickname?: string;
};

export type ForumReply = {
  id: number;
  topic_id: number | null;
  user_id: string | null;
  conteudo: string;
  autor: string | null;
  oculto: boolean | null;
  created_at: string | null;
  author_nickname?: string;
};

export type ForumProfile = {
  id: string;
  nickname: string;
};

export type ForumAdTipo = "clinica" | "modelo" | "campanha";

export type ForumAd = {
  id: number;
  titulo: string;
  descricao: string | null;
  imagem: string | null;
  link: string | null;
  ativo: boolean | null;
  ordem: number | null;
  tipo: ForumAdTipo | string | null;
  created_at: string | null;
};

export type ForumState = {
  estado: string;
  nome: string;
  slug: string;
};

export type ForumKind = {
  tipo: string;
  nome: string;
  slug: string;
};
