import { useState, type FormEvent } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { saveAlpaca } from "#/lib/data.functions";

type AlpacaFormValue = {
  id?: string;
  name: string;
  bio: string;
  furColor: string;
  spitRisk: "low" | "medium" | "high";
  dailyRate: number;
  imageUrl: string | null;
  active: boolean;
};
export function AlpacaForm({ alpaca }: { alpaca?: AlpacaFormValue }) {
  const save = useServerFn(saveAlpaca);
  const navigate = useNavigate();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    try {
      const spitRisk = form.get("spitRisk");
      if (spitRisk !== "low" && spitRisk !== "medium" && spitRisk !== "high")
        throw new Error("Ungültiges Spuckrisiko.");
      await save({
        data: {
          id: alpaca?.id,
          name: field("name"),
          bio: field("bio"),
          furColor: field("furColor"),
          spitRisk,
          dailyRate: Math.round(Number(form.get("dailyRate")) * 100),
          imageUrl: field("imageUrl"),
          active: form.get("active") === "on",
        },
      });
      await router.invalidate();
      await navigate({ to: "/admin/alpacas" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Speichern fehlgeschlagen.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form className="form-card form-grid" onSubmit={submit}>
      <label>
        Name
        <input name="name" required minLength={2} defaultValue={alpaca?.name} />
      </label>
      <label>
        Fellfarbe
        <input
          name="furColor"
          required
          defaultValue={alpaca?.furColor}
          placeholder="z. B. Karamell"
        />
      </label>
      <label className="full">
        Bio
        <textarea name="bio" required minLength={10} rows={5} defaultValue={alpaca?.bio} />
      </label>
      <label>
        Tagesmiete in EUR
        <input
          name="dailyRate"
          required
          type="number"
          min="1"
          step="0.01"
          defaultValue={alpaca ? alpaca.dailyRate / 100 : 89}
        />
      </label>
      <label>
        Spuckrisiko
        <select name="spitRisk" defaultValue={alpaca?.spitRisk ?? "low"}>
          <option value="low">Niedrig</option>
          <option value="medium">Mittel</option>
          <option value="high">Hoch</option>
        </select>
      </label>
      <label className="full">
        Bild-URL
        <input
          name="imageUrl"
          type="url"
          defaultValue={alpaca?.imageUrl ?? ""}
          placeholder="https://…"
        />
      </label>
      <label className="check-row full">
        <input name="active" type="checkbox" defaultChecked={alpaca?.active ?? true} /> Im Katalog
        aktiv
      </label>
      {error && (
        <p className="form-error full" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions full">
        <button className="button-primary" disabled={pending}>
          {pending ? "Speichert …" : "Alpaka speichern"}
        </button>
      </div>
    </form>
  );
}
