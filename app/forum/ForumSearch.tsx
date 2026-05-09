import Link from "next/link";
import { Search, X } from "lucide-react";

export default function ForumSearch({
  action,
  placeholder,
  query,
}: {
  action: string;
  placeholder: string;
  query: string;
}) {
  return (
    <form action={action} className="premium-search mb-8">
      <Search size={18} className="ml-3 shrink-0 text-[#38bdf8]" />
      <label className="flex-1">
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
        />
      </label>

      <div className="flex gap-2 max-sm:w-full">
        {query ? (
          <Link href={action} className="icon-button" aria-label="Limpar busca">
            <X size={18} />
          </Link>
        ) : null}

        <button type="submit" className="secondary-button max-sm:flex-1">
          Buscar
        </button>
      </div>
    </form>
  );
}
