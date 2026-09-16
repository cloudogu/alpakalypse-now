# Alpakalypse Now

Demo-Anwendung für einen fiktiven Alpaka-Verleih, umgesetzt mit TanStack Start, Better Auth, Drizzle ORM und SQLite.

## Lokal starten

```bash
vp install
vp run db:setup
vp dev
```

Die SQLite-Datei wird über `DATABASE_URL` in `.env.local` konfiguriert. Falls die Variable fehlt, nutzt die App `./alpakalypse.db`.

## Mit Docker starten

Beim Start führt die Anwendung automatisch alle ausstehenden Drizzle-Migrationen aus und legt die Demo-Daten idempotent an. Ein neues SQLite-Volume benötigt daher keinen manuellen `db:setup`-Aufruf.

```bash
docker build -t alpakalypse-now .
export BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
docker run --rm \
  -p 3000:3000 \
  -v alpakalypse-data:/data \
  -e BETTER_AUTH_SECRET \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  alpakalypse-now
```

Für ein Deployment muss `BETTER_AUTH_URL` auf die öffentlich erreichbare HTTPS-Adresse zeigen und `BETTER_AUTH_SECRET` dauerhaft über den Secret-Store der Plattform bereitgestellt werden.

Mit `SKIP_DATABASE_SEED=true` wird das automatische Anlegen der Demo-Daten übersprungen. Die Schema-Migrationen werden unabhängig davon weiterhin ausgeführt:

```bash
docker run --rm \
  -p 3000:3000 \
  -v alpakalypse-data:/data \
  -e BETTER_AUTH_SECRET \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -e SKIP_DATABASE_SEED=true \
  alpakalypse-now
```

## Demo-Zugänge

- Admin: `admin@alpakalypse.demo` / `Flausch123!`
- Kunde: `kunde@alpakalypse.demo` / `Flausch123!`

Bitte ausschließlich Demo-Daten verwenden. Die Anwendung verarbeitet keine Zahlungen und versendet keine E-Mails.

## Nützliche Befehle

```bash
vp run db:generate  # Migration aus dem Schema generieren
vp run db:migrate   # Migrationen anwenden
vp run db:seed      # Demo-Daten einspielen
vp check            # Format, Lint und Typprüfung
vp run test:unit          # Schnelle Unit-Tests
vp run test:integration   # Integrationstests mit In-Memory-SQLite
vp run test:coverage      # Coverage-Bericht ohne Schwellwert
vp run test:e2e:install   # Chromium einmalig installieren
vp run test:e2e           # Kritische Browser-Flows
vp run test:all           # Unit-, Integrations- und E2E-Tests
vp build            # Produktions-Build
```

Die E2E-Suite verwendet ausschließlich `.test-data/e2e.db`, setzt sie vor jedem Test zurück und verändert die lokale Entwicklungsdatenbank nicht. Fehlerartefakte liegen unter `playwright-report` und `test-results`.

Eine CI-Pipeline sollte provider-neutral folgende Schritte ausführen: `vp install --frozen-lockfile`, `vp run test:e2e:install`, `vp check`, `vp run test:coverage`, `vp build` und `vp run test:e2e`. Coverage-, Playwright- und Test-Result-Verzeichnisse sollten als Artefakte veröffentlicht werden.
