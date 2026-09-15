import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus } from "lucide-react";
import { listAdminAlpacas, setAlpacaActive } from "#/lib/data.functions";
import { formatMoney } from "#/lib/format";

export const Route = createFileRoute("/admin/alpacas/")({
  loader: () => listAdminAlpacas(),
  component: AlpacasAdmin,
});
function AlpacasAdmin() {
  const alpacas = Route.useLoaderData();
  const toggle = useServerFn(setAlpacaActive);
  const navigate = Route.useNavigate();
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Herdenmanagement</span>
          <h1 className="display-title">Alpakas</h1>
        </div>
        <Link to="/admin/alpacas/new" className="button-primary">
          <Plus /> Neu anlegen
        </Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Fell</th>
              <th>Preis</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {alpacas.map((alpaca) => (
              <tr key={alpaca.id}>
                <td>
                  <strong>{alpaca.name}</strong>
                </td>
                <td>{alpaca.furColor}</td>
                <td>{formatMoney(alpaca.dailyRate)}</td>
                <td>
                  <span
                    className={`status-badge ${alpaca.active ? "status-confirmed" : "status-cancelled"}`}
                  >
                    {alpaca.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Link
                      to="/admin/alpacas/$id/edit"
                      params={{ id: alpaca.id }}
                      className="icon-link"
                      aria-label={`${alpaca.name} bearbeiten`}
                    >
                      <Pencil />
                    </Link>
                    <button
                      onClick={async () => {
                        await toggle({ data: { id: alpaca.id, active: !alpaca.active } });
                        await navigate({
                          to: "/admin/alpacas",
                          replace: true,
                          reloadDocument: true,
                        });
                      }}
                    >
                      {alpaca.active ? "Deaktivieren" : "Aktivieren"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
