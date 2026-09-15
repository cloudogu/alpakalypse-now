import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, Sparkles } from "lucide-react";
import { getAlpaca } from "#/lib/data.functions";
import { formatDate, formatMoney } from "#/lib/format";

export const Route = createFileRoute("/alpacas/$alpacaId")({
  loader: ({ params }) => getAlpaca({ data: { id: params.alpacaId } }),
  component: Detail,
});
function Detail() {
  const { alpaca, blocked } = Route.useLoaderData();
  const risk = {
    low: "eher Gentleman",
    medium: "situationsabhängig",
    high: "mit Sicherheitsabstand",
  }[alpaca.spitRisk];
  return (
    <main className="page-wrap page-section">
      <Link to="/alpacas" className="back-link">
        <ChevronLeft /> Zur Auswahl
      </Link>
      <div className="detail-grid">
        <div className="detail-image">
          {alpaca.imageUrl ? (
            <img src={alpaca.imageUrl} alt={`Alpaka ${alpaca.name}`} />
          ) : (
            <div className="image-fallback">🦙</div>
          )}
          <span className="floating-stamp">
            <Sparkles /> Charaktertier
          </span>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">Fellfarbe · {alpaca.furColor}</span>
          <h1 className="display-title">Hallo, ich bin {alpaca.name}.</h1>
          <p className="detail-bio">{alpaca.bio}</p>
          <dl className="facts">
            <div>
              <dt>Tagesmiete</dt>
              <dd>{formatMoney(alpaca.dailyRate)}</dd>
            </div>
            <div>
              <dt>Spuckrisiko</dt>
              <dd>{risk}</dd>
            </div>
          </dl>
          <Link
            to="/booking/$alpacaId"
            params={{ alpacaId: alpaca.id }}
            className="button-primary wide"
          >
            Jetzt {alpaca.name} buchen
          </Link>
        </div>
      </div>
      <section className="availability">
        <div>
          <span className="eyebrow">Verfügbarkeit</span>
          <h2 className="display-title">Bereits verplant</h2>
          <p>Alle anderen zukünftigen Tage sind aktuell frei.</p>
        </div>
        <div className="blocked-list">
          {blocked.length ? (
            blocked.map((range) => (
              <div key={range.id}>
                <CalendarDays />
                <span>
                  <strong>{formatDate(range.startDate)}</strong> bis{" "}
                  <strong>{formatDate(range.endDate)}</strong>
                </span>
              </div>
            ))
          ) : (
            <div>
              <CalendarDays />
              <span>Noch freie Bahn – keine Buchungen vorhanden.</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
