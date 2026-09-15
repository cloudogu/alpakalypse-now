import { createFileRoute } from "@tanstack/react-router";
import { AlpacaForm } from "#/components/alpaca-form";

export const Route = createFileRoute("/admin/alpacas/new")({ component: NewAlpaca });
function NewAlpaca() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Herdenzuwachs</span>
        <h1 className="display-title">Alpaka anlegen</h1>
        <p>Ein neuer Charakter betritt die Bühne.</p>
      </div>
      <AlpacaForm />
    </>
  );
}
