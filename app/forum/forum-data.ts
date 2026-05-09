import { supabase } from "@/lib/supabase";
import type {
  ForumAd,
  ForumCategory,
  ForumKind,
  ForumProfile,
  ForumReply,
  ForumState,
  ForumTopic,
} from "./forum-types";
import { escapeLikePattern, normalizeSearchQuery } from "./forum-utils";

type SupabaseTopic = Omit<ForumTopic, "forum_categories" | "nota"> & {
  nota: number | string | null;
  forum_categories?:
    | ForumTopic["forum_categories"]
    | NonNullable<ForumTopic["forum_categories"]>[]
    | null;
};

type SupabaseReply = ForumReply;

export const forumStates: ForumState[] = [
  { estado: "SP", nome: "São Paulo", slug: "sao-paulo" },
  { estado: "MG", nome: "Minas Gerais", slug: "minas-gerais" },
  { estado: "RJ", nome: "Rio de Janeiro", slug: "rio-de-janeiro" },
  { estado: "PR", nome: "Paraná", slug: "parana" },
  { estado: "SC", nome: "Santa Catarina", slug: "santa-catarina" },
  { estado: "RS", nome: "Rio Grande do Sul", slug: "rio-grande-do-sul" },
];

export const forumKinds: ForumKind[] = [
  { tipo: "clinica", nome: "Clínicas", slug: "clinicas" },
  { tipo: "massagem", nome: "Massagens", slug: "massagens" },
  { tipo: "boate", nome: "Boates", slug: "boates" },
  { tipo: "prive", nome: "Privês", slug: "prives" },
  {
    tipo: "freelancer",
    nome: "Acompanhantes Freelancers",
    slug: "acompanhantes-freelancers",
  },
  { tipo: "swing", nome: "Casas de Swing", slug: "casas-de-swing" },
];

const categorySelect =
  "id, nome, slug, descricao, parent_id, estado, tipo, clinic_id, created_at";

const adSelect =
  "id, titulo, descricao, imagem, link, ativo, ordem, tipo, created_at";

const topicSelect = `
  id,
  titulo,
  slug,
  conteudo,
  category_id,
  clinic_id,
  user_id,
  autor,
  nota,
  fixado,
  trancado,
  oculto,
  created_at,
  updated_at,
  views,
  pinned,
  locked,
  forum_categories (
    id,
    nome,
    slug,
    parent_id,
    estado,
    tipo,
    clinic_id
  )
`;

export async function getCategoriesWithStats() {
  const categories = await getAllCategories();

  return hydrateCategoryStats(categories);
}

export async function getForumAds(limit = 8) {
  const { data, error } = await supabase
    .from("forum_ads")
    .select(adSelect)
    .eq("ativo", true)
    .order("ordem", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch forum ads", error.message);
    return [];
  }

  return (data || []) as ForumAd[];
}

export async function getRecentTopics(limit = 20) {
  const topics = await fetchTopicRows({ limit });

  return withTopicAuthors(await withReplyCounts(topics));
}

export async function getCategoryById(categoryId: number) {
  const { data, error } = await supabase
    .from("forum_categories")
    .select(categorySelect)
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ForumCategory | null;
}

export async function getCategoryPath(categoryId: number) {
  const categories = await getAllCategories();
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const path: ForumCategory[] = [];
  let current = categoryById.get(categoryId);

  while (current) {
    path.unshift(current);
    current =
      typeof current.parent_id === "number"
        ? categoryById.get(current.parent_id)
        : undefined;
  }

  return path;
}

export async function getChildCategories(parentId: number) {
  const { data, error } = await supabase
    .from("forum_categories")
    .select(categorySelect)
    .eq("parent_id", parentId)
    .order("clinic_id", { ascending: true, nullsFirst: true })
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ForumCategory[];
}

export async function getTopicsByCategory(categoryId: number) {
  const categories = await getAllCategories();
  const categoryIds = getDescendantCategoryIds(categoryId, categories);
  const topics = await fetchTopicRows({ categoryIds });

  return withTopicAuthors(await withReplyCounts(topics));
}

export async function searchTopics({
  categoryId,
  limit = 40,
  query,
}: {
  categoryId?: number;
  limit?: number;
  query: string;
}) {
  const searchQuery = normalizeSearchQuery(query);

  if (!searchQuery) {
    return categoryId ? getTopicsByCategory(categoryId) : getRecentTopics(limit);
  }

  const categories = categoryId ? await getAllCategories() : [];
  const categoryIds =
    typeof categoryId === "number"
      ? getDescendantCategoryIds(categoryId, categories)
      : undefined;

  const [titleMatches, contentMatches] = await Promise.all([
    fetchTopicRows({
      categoryIds,
      limit,
      searchColumn: "titulo",
      searchTerm: searchQuery,
    }),
    fetchTopicRows({
      categoryIds,
      limit,
      searchColumn: "conteudo",
      searchTerm: searchQuery,
    }),
  ]);

  const byId = new Map<number, ForumTopic>();

  for (const topic of [...titleMatches, ...contentMatches]) {
    byId.set(topic.id, topic);
  }

  const topics = Array.from(byId.values())
    .sort((a, b) => {
      if (Boolean(a.fixado) !== Boolean(b.fixado)) {
        return Number(Boolean(b.fixado)) - Number(Boolean(a.fixado));
      }

      return dateValue(b.created_at) - dateValue(a.created_at);
    })
    .slice(0, limit);

  return withTopicAuthors(await withReplyCounts(topics));
}

export async function getTopicById(topicId: number) {
  const { data, error } = await supabase
    .from("forum_topics")
    .select(topicSelect)
    .eq("id", topicId)
    .or("oculto.is.null,oculto.eq.false")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [topic] = await withTopicAuthors(
    await withReplyCounts([normalizeTopic(data as unknown as SupabaseTopic)])
  );

  return topic || null;
}

export async function getTopicBySlug(slug: string) {
  const { data, error } = await supabase
    .from("forum_topics")
    .select(topicSelect)
    .eq("slug", slug)
    .or("oculto.is.null,oculto.eq.false")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [topic] = await withTopicAuthors([
    normalizeTopic(data as unknown as SupabaseTopic),
  ]);

  return topic || null;
}

export async function getRepliesByTopic(topicId: number) {
  const { data, error } = await supabase
    .from("forum_replies")
    .select("id, topic_id, user_id, conteudo, autor, oculto, created_at")
    .eq("topic_id", topicId)
    .or("oculto.is.null,oculto.eq.false")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return withReplyAuthors((data || []) as SupabaseReply[]);
}

export async function getNewTopicCategory(categoryId: number) {
  const category = await getCategoryById(categoryId);

  if (!category) {
    return null;
  }

  const path = await getCategoryPath(category.id);

  return { category, path };
}

export async function getCategoryOptions() {
  const categories = await getCategoriesWithStats();

  return categories
    .filter((category) => Boolean(category.estado || category.clinic_id))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function safeAuthorName(
  value: string | null | undefined,
  fallback = "Anônimo"
) {
  const name = (value || "").replace(/\s+/g, " ").trim();

  if (!name || name.includes("@")) {
    return fallback;
  }

  return name.slice(0, 32);
}

async function getAllCategories() {
  const { data, error } = await supabase
    .from("forum_categories")
    .select(categorySelect)
    .order("parent_id", { ascending: true, nullsFirst: true })
    .order("estado", { ascending: true, nullsFirst: false })
    .order("tipo", { ascending: true, nullsFirst: true })
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ForumCategory[];
}

async function hydrateCategoryStats(categories: ForumCategory[]) {
  const [{ data: topics }, { data: replies }] = await Promise.all([
    supabase
      .from("forum_topics")
      .select("id, category_id, created_at")
      .or("oculto.is.null,oculto.eq.false"),
    supabase
      .from("forum_replies")
      .select("topic_id, created_at")
      .or("oculto.is.null,oculto.eq.false"),
  ]);

  const childCounts = new Map<number, number>();
  const topicCounts = new Map<number, number>();
  const replyCounts = new Map<number, number>();
  const lastActivity = new Map<number, string>();
  const topicCategory = new Map<number, number>();

  for (const category of categories) {
    if (typeof category.parent_id === "number") {
      childCounts.set(
        category.parent_id,
        (childCounts.get(category.parent_id) || 0) + 1
      );
    }
  }

  for (const topic of topics || []) {
    if (
      typeof topic.id !== "number" ||
      typeof topic.category_id !== "number"
    ) {
      continue;
    }

    topicCategory.set(topic.id, topic.category_id);

    for (const categoryId of getAncestorCategoryIds(
      topic.category_id,
      categories
    )) {
      topicCounts.set(categoryId, (topicCounts.get(categoryId) || 0) + 1);
      setLatest(lastActivity, categoryId, topic.created_at);
    }
  }

  for (const reply of replies || []) {
    if (typeof reply.topic_id !== "number") {
      continue;
    }

    const categoryId = topicCategory.get(reply.topic_id);

    if (!categoryId) {
      continue;
    }

    for (const ancestorId of getAncestorCategoryIds(categoryId, categories)) {
      replyCounts.set(ancestorId, (replyCounts.get(ancestorId) || 0) + 1);
      setLatest(lastActivity, ancestorId, reply.created_at);
    }
  }

  return categories.map((category) => ({
    ...category,
    topic_count: topicCounts.get(category.id) || 0,
    reply_count: replyCounts.get(category.id) || 0,
    child_count: childCounts.get(category.id) || 0,
    last_activity_at: lastActivity.get(category.id) || null,
  }));
}

async function withReplyCounts(topics: ForumTopic[]) {
  if (topics.length === 0) {
    return topics;
  }

  const topicIds = topics.map((topic) => topic.id);
  const { data } = await supabase
    .from("forum_replies")
    .select("topic_id, created_at")
    .in("topic_id", topicIds)
    .or("oculto.is.null,oculto.eq.false");

  const counts = new Map<number, number>();
  const lastReply = new Map<number, string>();

  for (const reply of data || []) {
    if (typeof reply.topic_id === "number") {
      counts.set(reply.topic_id, (counts.get(reply.topic_id) || 0) + 1);
      setLatest(lastReply, reply.topic_id, reply.created_at);
    }
  }

  return topics.map((topic) => ({
    ...topic,
    reply_count: counts.get(topic.id) || 0,
    last_reply_at: lastReply.get(topic.id) || null,
  }));
}

async function withTopicAuthors(topics: ForumTopic[]) {
  const profiles = await getProfilesByIds(
    topics.map((topic) => topic.user_id).filter(Boolean) as string[]
  );

  return topics.map((topic) => ({
    ...topic,
    author_nickname: topic.user_id
      ? safeAuthorName(profiles.get(topic.user_id), "Usuário")
      : safeAuthorName(topic.autor, "Anônimo"),
  }));
}

async function withReplyAuthors(replies: ForumReply[]) {
  const profiles = await getProfilesByIds(
    replies.map((reply) => reply.user_id).filter(Boolean) as string[]
  );

  return replies.map((reply) => ({
    ...reply,
    author_nickname: reply.user_id
      ? safeAuthorName(profiles.get(reply.user_id), "Usuário")
      : safeAuthorName(reply.autor, "Anônimo"),
  }));
}

async function getProfilesByIds(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds));

  if (uniqueIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    ((data || []) as ForumProfile[]).map((profile) => [
      profile.id,
      profile.nickname,
    ])
  );
}

async function fetchTopicRows({
  categoryIds,
  limit,
  searchColumn,
  searchTerm,
}: {
  categoryIds?: number[];
  limit?: number;
  searchColumn?: "titulo" | "conteudo";
  searchTerm?: string;
}) {
  let request = supabase
    .from("forum_topics")
    .select(topicSelect)
    .or("oculto.is.null,oculto.eq.false")
    .order("fixado", { ascending: false })
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (categoryIds && categoryIds.length > 0) {
    request =
      categoryIds.length === 1
        ? request.eq("category_id", categoryIds[0])
        : request.in("category_id", categoryIds);
  }

  if (searchColumn && searchTerm) {
    request = request.ilike(searchColumn, `%${escapeLikePattern(searchTerm)}%`);
  }

  if (limit) {
    request = request.limit(limit);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as unknown as SupabaseTopic[]).map(normalizeTopic);
}

function normalizeTopic(topic: SupabaseTopic): ForumTopic {
  const category = Array.isArray(topic.forum_categories)
    ? topic.forum_categories[0] || null
    : topic.forum_categories || null;
  const rawNota = topic.nota;

  return {
    ...topic,
    nota: rawNota === null || rawNota === undefined ? null : Number(rawNota),
    fixado: Boolean(topic.fixado ?? topic.pinned ?? false),
    trancado: Boolean(topic.trancado ?? topic.locked ?? false),
    oculto: Boolean(topic.oculto ?? false),
    forum_categories: category,
  };
}

function getDescendantCategoryIds(
  categoryId: number,
  categories: ForumCategory[]
) {
  const childrenByParent = new Map<number, number[]>();

  for (const category of categories) {
    if (typeof category.parent_id === "number") {
      const children = childrenByParent.get(category.parent_id) || [];
      children.push(category.id);
      childrenByParent.set(category.parent_id, children);
    }
  }

  const result = new Set<number>([categoryId]);
  const queue = [categoryId];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    for (const childId of childrenByParent.get(current) || []) {
      if (!result.has(childId)) {
        result.add(childId);
        queue.push(childId);
      }
    }
  }

  return Array.from(result);
}

function getAncestorCategoryIds(categoryId: number, categories: ForumCategory[]) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const result: number[] = [];
  let current = categoryById.get(categoryId);

  while (current) {
    result.push(current.id);
    current =
      typeof current.parent_id === "number"
        ? categoryById.get(current.parent_id)
        : undefined;
  }

  return result;
}

function setLatest(
  map: Map<number, string>,
  key: number,
  value: string | null | undefined
) {
  if (!value) {
    return;
  }

  const current = map.get(key);

  if (!current || dateValue(value) > dateValue(current)) {
    map.set(key, value);
  }
}

function dateValue(value: string | null | undefined) {
  return value ? new Date(value).getTime() : 0;
}
