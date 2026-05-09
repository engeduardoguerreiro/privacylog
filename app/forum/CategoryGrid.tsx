import type { ForumCategory } from "./forum-types";
import ForumCategoryCard from "./ForumCategoryCard";

export default function CategoryGrid({
  categories,
  columns = "four",
  variant = "grid",
}: {
  categories: ForumCategory[];
  columns?: "three" | "four";
  variant?: "grid" | "rows";
}) {
  const gridColumns = columns === "three" ? "md:grid-cols-3" : "md:grid-cols-4";
  const sortedCategories = [...categories].sort(compareCategories);

  if (variant === "rows") {
    return (
      <div className="forum-category-list">
        {sortedCategories.map((category) => (
          <ForumCategoryCard
            key={category.id}
            category={category}
            variant="row"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${gridColumns}`}>
      {sortedCategories.map((category) => (
        <ForumCategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

const categoryOrder = new Map(
  [
    "clinica",
    "massagem",
    "boate",
    "prive",
    "freelancer",
    "swing",
  ].map((tipo, index) => [tipo, index])
);

function compareCategories(a: ForumCategory, b: ForumCategory) {
  const orderA = categoryOrder.get(a.tipo || "") ?? 99;
  const orderB = categoryOrder.get(b.tipo || "") ?? 99;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return a.nome.localeCompare(b.nome, "pt-BR");
}
