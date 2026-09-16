import { useState, type FormEvent } from "react";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { getCurrentUser } from "#/lib/data.functions";
import { safeRedirect } from "#/lib/navigation";
function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}
export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({ redirect: safeRedirect(search.redirect) }),
  beforeLoad: async ({ search }) => {
    if (await getCurrentUser()) throw redirect({ href: search.redirect });
  },
  component: Login,
});
function Login() {
  const { redirect: target } = Route.useSearch();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: field(form, "email"),
      password: field(form, "password"),
    });
    if (result.error) {
      setError("E-Mail oder Passwort stimmen nicht.");
      setPending(false);
      return;
    }
    window.location.assign(target);
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Willkommen zurück</span>
        <h1 className="display-title">Einlass zur Koppel</h1>
        <p>Melde dich an, um zu buchen und deine Termine zu verwalten.</p>
        <form onSubmit={submit}>
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
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button-primary wide" disabled={pending}>
            {pending ? "Meldet an …" : "Anmelden"}
          </button>
        </form>
        <p className="auth-switch">
          Noch kein Konto?{" "}
          <Link to="/register" search={{ redirect: target }}>
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </main>
  );
}
