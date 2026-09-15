import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, HeartHandshake, ShieldCheck } from "lucide-react";
import { AlpacaCard } from "#/components/alpaca-card";
import { listActiveAlpacas } from "#/lib/data.functions";

export const Route = createFileRoute("/")({ loader: () => listActiveAlpacas(), component: Home });
function Home() {
  const alpacas = Route.useLoaderData();
  return (
    <main>
      <section className="hero">
        <div className="page-wrap hero-grid">
          <div className="hero-copy rise-in">
            <span className="eyebrow">Alpaka-Verleih mit Haltung</span>
            <h1 className="display-title">
              Wenn's flauschig <em>eskalieren</em> soll.
            </h1>
            <p>
              Buche den entspanntesten Stargast für dein nächstes Fest. Null Smalltalk, hundert
              Prozent Flausch.
            </p>
            <div className="hero-actions">
              <Link to="/alpacas" className="button-primary">
                Alpakas entdecken <ArrowRight />
              </Link>
              <a href="#so-gehts" className="button-secondary">
                So funktioniert's
              </a>
            </div>
            <div className="trust-row">
              <span>
                <ShieldCheck /> Geprüft gelassen
              </span>
              <span>
                <HeartHandshake /> Tierwohl zuerst
              </span>
            </div>
          </div>
          <div className="hero-visual rise-in">
            <div className="sun-disc" />
            <img
              src="/alpacas/kevin.webp"
              alt="Kevin, ein karamellfarbenes Alpaka auf einer Weide"
            />
            <div className="hero-note">
              <span>Heute verfügbar</span>
              <strong>Flausch-Level 100</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="page-wrap section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Publikumslieblinge</span>
            <h2 className="display-title">Bereit für ihren Auftritt</h2>
          </div>
          <Link to="/alpacas" className="text-link">
            Alle ansehen <ArrowRight />
          </Link>
        </div>
        <div className="catalog-grid compact">
          {alpacas.slice(0, 3).map((alpaca) => (
            <AlpacaCard key={alpaca.id} alpaca={alpaca} />
          ))}
        </div>
      </section>
      <section id="so-gehts" className="how-section">
        <div className="page-wrap">
          <span className="eyebrow">Drei Schritte zum Flausch</span>
          <h2 className="display-title">Unkompliziert. Unvergesslich.</h2>
          <div className="steps">
            <article>
              <span>01</span>
              <CalendarDays />
              <h3>Termin wählen</h3>
              <p>Freien Zeitraum im Kalender finden.</p>
            </article>
            <article>
              <span>02</span>
              <HeartHandshake />
              <h3>Charakter matchen</h3>
              <p>Das Alpaka wählen, das zu euch passt.</p>
            </article>
            <article>
              <span>03</span>
              <ShieldCheck />
              <h3>Vorfreude starten</h3>
              <p>Buchung bestätigen und zurücklehnen.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
