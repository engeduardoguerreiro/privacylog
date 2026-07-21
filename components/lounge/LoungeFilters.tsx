export default function LoungeFilters() {
  return (
    <div className="filter-panel">
      <div className="filter-select-row">
        <label className="filter-select-field">
          <span className="filter-select-label">Cidade</span>
          <select className="filter-select" defaultValue="sao-paulo">
            <option value="sao-paulo">São Paulo</option>
            <option value="rio-de-janeiro">Rio de Janeiro</option>
            <option value="belo-horizonte">Belo Horizonte</option>
          </select>
        </label>
        <label className="filter-select-field">
          <span className="filter-select-label">Categoria</span>
          <select className="filter-select" defaultValue="todos">
            <option value="todos">Todas</option>
            <option value="clinica">Clínicas</option>
            <option value="massagem">Massagens</option>
            <option value="boate">Boates</option>
            <option value="prive">Privês</option>
          </select>
        </label>
      </div>
    </div>
  );
}
