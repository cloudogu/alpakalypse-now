import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { Check, ReceiptText } from "lucide-react";
import { getBookingConfirmation, getCurrentUser } from "#/lib/data.functions";
import { formatDate, formatMoney } from "#/lib/format";

export const Route = createFileRoute("/booking/confirmation/$id")({
  beforeLoad: async ({ location }) => {
    if (!(await getCurrentUser()))
      throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  loader: ({ params }) => getBookingConfirmation({ data: { id: params.id } }),
  component: Confirmation,
});
function Confirmation() {
  const booking = Route.useLoaderData();
  return (
    <main className="page-wrap page-section narrow">
      <div className="confirmation-card">
        <span className="success-icon">
          <Check />
        </span>
        <span className="eyebrow">Buchung bestätigt</span>
        <h1 className="display-title">Der Flausch ist reserviert.</h1>
        <p>
          {booking.alpacaName} freut sich vermutlich schon. Man kann es bei Alpakas nur nie ganz
          sicher sagen.
        </p>
        <dl>
          <div>
            <dt>Zeitraum</dt>
            <dd>
              {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
            </dd>
          </div>
          <div>
            <dt>Gesamtpreis</dt>
            <dd>{formatMoney(booking.totalPrice)}</dd>
          </div>
          <div>
            <dt>Buchungs-ID</dt>
            <dd>
              <code>{booking.id}</code>
            </dd>
          </div>
        </dl>
        <div className="invoice-note">
          <ReceiptText />
          <span>
            <strong>Deine fiktive Rechnung</strong>Diese Demo verschickt keine E-Mail und erstellt
            kein echtes Rechnungsdokument.
          </span>
        </div>
        <Link to="/profile" className="button-primary">
          Zum Profil
        </Link>
      </div>
    </main>
  );
}
