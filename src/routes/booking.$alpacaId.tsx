import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck } from "lucide-react";
import { createBooking, getAlpaca, getCurrentUser } from "#/lib/data.functions";
import { formatMoney, rentalDays } from "#/lib/format";

export const Route = createFileRoute("/booking/$alpacaId")({
  beforeLoad: async ({ location }) => {
    if (!(await getCurrentUser()))
      throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  loader: ({ params }) => getAlpaca({ data: { id: params.alpacaId } }),
  component: Booking,
});
function Booking() {
  const { alpaca, blocked } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const create = useServerFn(createBooking);
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const days = useMemo(
    () => (startDate && endDate ? Math.max(0, rentalDays(startDate, endDate)) : 0),
    [startDate, endDate],
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await create({ data: { alpacaId: alpaca.id, startDate, endDate } });
      await navigate({ to: "/booking/confirmation/$id", params: { id: result.id } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Buchung fehlgeschlagen.");
    } finally {
      setPending(false);
    }
  }
  const min = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return (
    <main className="page-wrap page-section narrow">
      <div className="page-heading">
        <span className="eyebrow">Fast geschafft</span>
        <h1 className="display-title">Dein Date mit {alpaca.name}</h1>
        <p>Wähle den Zeitraum. Ein Miettag entspricht dem Abstand zwischen Start- und Enddatum.</p>
      </div>
      <form className="booking-layout" onSubmit={submit}>
        <div className="form-card">
          <div className="date-grid">
            <label>
              Startdatum
              <input
                type="date"
                required
                min={min}
                value={startDate}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              Enddatum
              <input
                type="date"
                required
                min={startDate || min}
                value={endDate}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
          {blocked.length > 0 && (
            <div className="form-note">
              <CalendarCheck /> Bereits belegt:{" "}
              {blocked.map((b) => `${b.startDate}–${b.endDate}`).join(", ")}
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <aside className="booking-summary">
          <span className="eyebrow">Zusammenfassung</span>
          <h2>{alpaca.name}</h2>
          <div>
            <span>
              {days || "–"} {days === 1 ? "Tag" : "Tage"} × {formatMoney(alpaca.dailyRate)}
            </span>
            <strong>{formatMoney(days * alpaca.dailyRate)}</strong>
          </div>
          <button className="button-primary wide" disabled={pending || days < 1}>
            {pending ? "Bucht …" : "Verbindlich buchen"}
          </button>
          <small>Demo-Buchung · Es erfolgt keine Zahlung.</small>
        </aside>
      </form>
    </main>
  );
}
