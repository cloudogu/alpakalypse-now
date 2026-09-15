import { Link, useRouter } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import { authClient } from "#/lib/auth-client";

export function SiteHeader() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  return (
    <header className="site-header">
      <div className="page-wrap nav-row">
        <Link to="/" className="brand" aria-label="Alpakalypse Now Startseite">
          <span className="brand-mark">A</span>
          <span>
            <strong>Alpakalypse</strong>
            <small>Now</small>
          </span>
        </Link>
        <nav aria-label="Hauptnavigation">
          <Link to="/alpacas" className="nav-link" activeProps={{ className: "is-active" }}>
            Alpakas
          </Link>
          {session?.user ? (
            <>
              <Link to="/profile" className="nav-link" activeProps={{ className: "is-active" }}>
                <UserRound /> Profil
              </Link>
              {session.user.role === "admin" && (
                <Link to="/admin" className="nav-link">
                  Verwaltung
                </Link>
              )}
              <button
                className="nav-button"
                onClick={async () => {
                  await authClient.signOut();
                  await router.invalidate();
                  window.location.assign("/");
                }}
              >
                <LogOut /> Abmelden
              </button>
            </>
          ) : !isPending ? (
            <Link to="/login" search={{ redirect: "/" }} className="nav-pill">
              Anmelden
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
