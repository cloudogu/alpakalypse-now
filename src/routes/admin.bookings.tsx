import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { StatusBadge } from "#/components/status-badge";
import { adminCancelBooking, listAdminBookings } from "#/lib/data.functions";
import { formatDate, formatMoney } from "#/lib/format";

export const Route = createFileRoute("/admin/bookings")({
  loader: () => listAdminBookings(),
  component: BookingsAdmin,
});
function BookingsAdmin() {
  const bookings = Route.useLoaderData();
  const cancel = useServerFn(adminCancelBooking);
  const navigate = Route.useNavigate();
  const [filter, setFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const visible = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Terminlage</span>
          <h1 className="display-title">Buchungen</h1>
        </div>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "all" || value === "confirmed" || value === "cancelled") setFilter(value);
          }}
        >
          <option value="all">Alle Status</option>
          <option value="confirmed">Bestätigt</option>
          <option value="cancelled">Storniert</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kunde</th>
              <th>Alpaka</th>
              <th>Zeitraum</th>
              <th>Preis</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <strong>{booking.customerName}</strong>
                  <small>{booking.customerEmail}</small>
                </td>
                <td>{booking.alpacaName}</td>
                <td>
                  {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                </td>
                <td>{formatMoney(booking.totalPrice)}</td>
                <td>
                  <StatusBadge status={booking.status} />
                </td>
                <td>
                  {booking.status === "confirmed" && (
                    <button
                      className="button-danger"
                      onClick={async () => {
                        await cancel({ data: { id: booking.id } });
                        await navigate({
                          to: "/admin/bookings",
                          replace: true,
                          reloadDocument: true,
                        });
                      }}
                    >
                      Stornieren
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
