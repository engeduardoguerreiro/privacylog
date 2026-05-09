import { isAdminUser } from "@/lib/auth/admin";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type ClinicSeedRow = {
  id: number;
  nome: string;
  estado: string | null;
  tipo: string | null;
  forum: string | null;
};

const states = [
  { estado: "SP", nome: "São Paulo" },
  { estado: "MG", nome: "Minas Gerais" },
  { estado: "RJ", nome: "Rio de Janeiro" },
  { estado: "PR", nome: "Paraná" },
  { estado: "SC", nome: "Santa Catarina" },
  { estado: "RS", nome: "Rio Grande do Sul" },
];

const lifestyleCategories = [
  {
    tipo: "freelancer",
    nome: "Acompanhantes Freelancers",
    slugPart: "acompanhantes-freelancers",
    description:
      "Relatos, dúvidas e recomendações sobre acompanhantes freelancers em",
  },
  {
    tipo: "swing",
    nome: "Casas de Swing",
    slugPart: "casas-de-swing",
    description: "Relatos, dúvidas e recomendações sobre casas de swing em",
  },
];

const expectedLifestyleCategoryCount =
  states.length * lifestyleCategories.length;
const clinicCategoryTypes = ["clinica", "massagem", "boate", "prive"];

export async function ensureForumLifestyleCategoriesForAdmin() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return;
  }

  const supabase = await createClient();

  await ensureLifestyleCategories(supabase);
  await ensureClinicForumCategories(supabase);
}

async function ensureLifestyleCategories(supabase: SupabaseServerClient) {
  const { count } = await supabase
    .from("forum_categories")
    .select("id", { count: "exact", head: true })
    .in(
      "tipo",
      lifestyleCategories.map((category) => category.tipo)
    )
    .not("parent_id", "is", null)
    .is("clinic_id", null);

  if ((count || 0) >= expectedLifestyleCategoryCount) {
    return;
  }

  const { data: stateRows, error: statesError } = await supabase
    .from("forum_categories")
    .select("id, estado, nome")
    .is("parent_id", null)
    .in(
      "estado",
      states.map((state) => state.estado)
    );

  if (statesError || !stateRows?.length) {
    console.error(
      "Failed to load forum state categories",
      statesError?.message
    );
    return;
  }

  const stateNameByCode = new Map(
    states.map((state) => [state.estado, state.nome])
  );
  const rows = stateRows.flatMap((stateRow) =>
    lifestyleCategories.map((category) => {
      const stateName =
        stateNameByCode.get(stateRow.estado || "") ||
        stateRow.nome ||
        stateRow.estado;

      return {
        nome: category.nome,
        slug: `${String(stateRow.estado).toLowerCase()}-${category.slugPart}`,
        descricao: `${category.description} ${stateName}.`,
        parent_id: stateRow.id,
        estado: stateRow.estado,
        tipo: category.tipo,
        clinic_id: null,
      };
    })
  );

  const { error } = await supabase
    .from("forum_categories")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    console.error("Failed to seed lifestyle forum categories", error.message);
  }
}

async function ensureClinicForumCategories(supabase: SupabaseServerClient) {
  const { data: clinics, error: clinicsError } = await supabase
    .from("clinicas")
    .select("id, nome, estado, tipo, forum")
    .in("estado", states.map((state) => state.estado))
    .in("tipo", clinicCategoryTypes);

  if (clinicsError) {
    console.error("Failed to load clinics for forum sync", clinicsError.message);
    return;
  }

  const pendingClinics = ((clinics || []) as ClinicSeedRow[]).filter(
    (clinic) => !clinic.forum
  );

  if (pendingClinics.length === 0) {
    return;
  }

  const { data: parents, error: parentsError } = await supabase
    .from("forum_categories")
    .select("id, estado, tipo")
    .not("parent_id", "is", null)
    .is("clinic_id", null)
    .in("estado", states.map((state) => state.estado))
    .in("tipo", clinicCategoryTypes);

  if (parentsError || !parents?.length) {
    console.error(
      "Failed to load parent forum categories",
      parentsError?.message
    );
    return;
  }

  const parentByStateAndType = new Map(
    parents.map((parent) => [`${parent.estado}:${parent.tipo}`, parent.id])
  );
  const categoryRows = pendingClinics.flatMap((clinic) => {
    const parentId = parentByStateAndType.get(`${clinic.estado}:${clinic.tipo}`);

    if (!parentId || !clinic.estado || !clinic.tipo) {
      return [];
    }

    return [
      {
        nome: clinic.nome,
        slug: `${clinic.tipo}-${clinic.id}-${slugify(clinic.nome)}`,
        descricao: `Discussões e avaliações sobre ${clinic.nome}`,
        parent_id: parentId,
        clinic_id: clinic.id,
        estado: clinic.estado,
        tipo: clinic.tipo,
      },
    ];
  });

  if (categoryRows.length === 0) {
    return;
  }

  const { data: forumCategories, error: forumError } = await supabase
    .from("forum_categories")
    .upsert(categoryRows, { onConflict: "slug" })
    .select("id, clinic_id");

  if (forumError) {
    console.error("Failed to sync clinic forum categories", forumError.message);
    return;
  }

  await Promise.all(
    (forumCategories || [])
      .filter((category) => category.id && category.clinic_id)
      .map((category) =>
        supabase
          .from("clinicas")
          .update({ forum: `/forum/categoria/${category.id}` })
          .eq("id", category.clinic_id)
      )
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
