import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, PawPrint } from "lucide-react";
import { getAdminDashboard } from "#/lib/data.functions";

export const Route = createFileRoute("/admin/")({
  loader: () => getAdminDashboard(),
  component: Dashboard,
});
function Dashboard() {
  const stats = Route.useLoaderData();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Dashboard</span>
        <h1 className="display-title">Alles im grünen Bereich.</h1>
        <p>Der schnelle Blick über Herde und Buchungslage.</p>
      </div>
      <div className="stat-grid">
        <Link to="/admin/alpacas">
          <PawPrint />
          <span>Alpakas gesamt</span>
          <strong>{stats.alpacas}</strong>
        </Link>
        <Link to="/admin/bookings">
          <CalendarCheck />
          <span>Aktive Buchungen</span>
          <strong>{stats.activeBookings}</strong>
        </Link>
      </div>
    </>
  );
}
