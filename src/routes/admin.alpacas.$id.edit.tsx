import { createFileRoute } from "@tanstack/react-router";
import { AlpacaForm } from "#/components/alpaca-form";
import { getAdminAlpaca } from "#/lib/data.functions";

export const Route = createFileRoute("/admin/alpacas/$id/edit")({
  loader: ({ params }) => getAdminAlpaca({ data: { id: params.id } }),
  component: EditAlpaca,
});
function EditAlpaca() {
  const alpaca = Route.useLoaderData();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Steckbriefpflege</span>
        <h1 className="display-title">{alpaca.name} bearbeiten</h1>
      </div>
      <AlpacaForm alpaca={alpaca} />
    </>
  );
}
