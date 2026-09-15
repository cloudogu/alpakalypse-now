import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { SiteHeader } from "#/components/site-header";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alpakalypse Now – Wenn's flauschig eskalieren soll" },
      { name: "description", content: "Der charmanteste fiktive Alpaka-Verleih weit und breit." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: () => <Outlet />,
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <main className="page-wrap page-section">
      <div className="empty-state">
        <span>404</span>
        <h1 className="display-title">Hier grast nichts.</h1>
        <p>Diese Seite ist wohl über die Koppel gehüpft.</p>
      </div>
    </main>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <HeadContent />
      </head>
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="page-wrap">
            <strong>Alpakalypse Now</strong>
            <span>Demo-Anwendung · Keine echten Buchungen oder Zahlungen</span>
          </div>
        </footer>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  );
}
