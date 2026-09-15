import { useState, type FormEvent } from "react";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { getCurrentUser } from "#/lib/data.functions";

function safeRedirect(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/profile";
}
function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}
export const Route = createFileRoute("/register")({
  validateSearch: (search) => ({ redirect: safeRedirect(search.redirect) }),
  beforeLoad: async ({ search }) => {
    if (await getCurrentUser()) throw redirect({ href: search.redirect });
  },
  component: Register,
});
function Register() {
  const { redirect: target } = Route.useSearch();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await authClient.signUp.email({
      name: field(form, "name"),
      email: field(form, "email"),
      password: field(form, "password"),
    });
    if (result.error) {
      setError(result.error.message ?? "Registrierung fehlgeschlagen.");
      setPending(false);
      return;
    }
    window.location.assign(target);
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Neu auf der Weide</span>
        <h1 className="display-title">Konto anlegen</h1>
        <p>Nur Demo-Daten verwenden – hier werden keine echten Personendaten benötigt.</p>
        <form onSubmit={submit}>
          <label>
            Name
            <input name="name" required minLength={2} autoComplete="name" />
          </label>
          <label>
            E-Mail
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Passwort
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button-primary wide" disabled={pending}>
            {pending ? "Legt Konto an …" : "Registrieren"}
          </button>
        </form>
        <p className="auth-switch">
          Schon dabei?{" "}
          <Link to="/login" search={{ redirect: target }}>
            Anmelden
          </Link>
        </p>
      </div>
    </main>
  );
}
