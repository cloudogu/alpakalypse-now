import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlpacaCard } from "#/components/alpaca-card";
import { listActiveAlpacas } from "#/lib/data.functions";

export const Route = createFileRoute("/alpacas/")({
  loader: () => listActiveAlpacas(),
  component: Catalog,
});
function Catalog() {
  const alpacas = Route.useLoaderData();
  const [color, setColor] = useState("Alle");
  const colors = useMemo(() => ["Alle", ...new Set(alpacas.map((a) => a.furColor))], [alpacas]);
  const filtered = color === "Alle" ? alpacas : alpacas.filter((a) => a.furColor === color);
  return (
    <main className="page-wrap page-section">
      <div className="page-heading">
        <span className="eyebrow">Die flauschige Auswahl</span>
        <h1 className="display-title">Welcher Charakter darf's sein?</h1>
        <p>Handverlesene Persönlichkeiten für Gartenfest, Teambuilding und kontrolliertes Chaos.</p>
      </div>
      <div className="filter-row" aria-label="Nach Fellfarbe filtern">
        {colors.map((item) => (
          <button
            key={item}
            className={color === item ? "filter-active" : ""}
            onClick={() => setColor(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="catalog-grid">
        {filtered.map((alpaca) => (
          <AlpacaCard key={alpaca.id} alpaca={alpaca} />
        ))}
      </div>
    </main>
  );
}
