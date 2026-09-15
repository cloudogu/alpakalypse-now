import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "#/lib/data.functions";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: "/login", search: { redirect: location.href } });
    if (user.role !== "admin") throw redirect({ to: "/" });
  },
  component: AdminLayout,
});
function AdminLayout() {
  return (
    <main className="page-wrap page-section">
      <div className="admin-shell">
        <aside>
          <span className="eyebrow">Verwaltung</span>
          <h2 className="display-title">Herde & Termine</h2>
          <nav>
            <Link to="/admin" activeOptions={{ exact: true }}>
              Übersicht
            </Link>
            <Link to="/admin/alpacas">Alpakas</Link>
            <Link to="/admin/bookings">Buchungen</Link>
          </nav>
        </aside>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
