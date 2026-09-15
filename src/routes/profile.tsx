import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Mail, UserRound } from "lucide-react";
import { StatusBadge } from "#/components/status-badge";
import { cancelOwnBooking, getCurrentUser, getProfile } from "#/lib/data.functions";
import { formatDate, formatMoney, todayIso } from "#/lib/format";

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ location }) => {
    if (!(await getCurrentUser()))
      throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  loader: () => getProfile(),
  component: Profile,
});
function Profile() {
  const data = Route.useLoaderData();
  const cancel = useServerFn(cancelOwnBooking);
  const navigate = Route.useNavigate();
  const [pending, setPending] = useState("");
  return (
    <main className="page-wrap page-section">
      <div className="profile-hero">
        <span className="profile-avatar">
          <UserRound />
        </span>
        <div>
          <span className="eyebrow">Dein Kundenprofil</span>
          <h1 className="display-title">Hallo, {data.user.name}</h1>
          <p>
            <Mail /> {data.user.email}
          </p>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Deine Termine</span>
          <h2 className="display-title">Buchungen</h2>
        </div>
      </div>
      {data.bookings.length ? (
        <div className="booking-list">
          {data.bookings.map((booking) => (
            <article key={booking.id}>
              <CalendarDays />
              <div className="booking-main">
                <div>
                  <h3>{booking.alpacaName}</h3>
                  <StatusBadge status={booking.status} />
                </div>
                <p>
                  {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                </p>
                <small>{booking.id}</small>
              </div>
              <strong>{formatMoney(booking.totalPrice)}</strong>
              {booking.status === "confirmed" && booking.startDate > todayIso() && (
                <button
                  className="button-danger"
                  disabled={pending === booking.id}
                  onClick={async () => {
                    setPending(booking.id);
                    await cancel({ data: { id: booking.id } });
                    await navigate({ to: "/profile", replace: true, reloadDocument: true });
                  }}
                >
                  Stornieren
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <CalendarDays />
          <h3>Noch kein Flausch im Kalender.</h3>
          <p>Deine erste Buchung wartet schon.</p>
        </div>
      )}
    </main>
  );
}
