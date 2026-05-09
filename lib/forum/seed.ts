import { isAdminUser } from "@/lib/auth/admin";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

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

export async function ensureForumLifestyleCategoriesForAdmin() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return;
  }

  const supabase = await createClient();

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
