# Alpakalypse Now

Alpakalypse Now ist eine Demo für einen fiktiven Alpaka-Verleih. Die Anwendung nutzt TanStack Start, Better Auth, Drizzle ORM und SQLite.

## Lokal starten

Installiere die Abhängigkeiten, richte die Datenbank ein und starte den Entwicklungsserver:

```bash
vp install
vp run db:setup
vp dev
```

Setze `DATABASE_URL` in `.env.local`, um eine andere SQLite-Datei zu verwenden. Ohne diese Variable nutzt die Anwendung `./alpakalypse.db`.

## Mit Docker starten

Baue zuerst das Image für die Architektur deines Rechners:

```bash
vp run docker:build
```

Der Befehl lädt das Image unter dem Namen `alpakalypse-now` in den lokalen Image-Store. Starte es mit einem persistenten Volume:

```bash
docker run --rm \
  -p 3000:3000 \
  -v alpakalypse-data:/data \
  alpakalypse-now
```

### Authentifizierung konfigurieren

Im Container hat `BETTER_AUTH_URL` den Standardwert `http://localhost:3000`. Für ein Deployment muss die Variable auf die öffentliche HTTPS-Adresse zeigen.

Fehlt `BETTER_AUTH_SECRET`, erzeugt der Entrypoint beim ersten Start ein zufälliges Secret. Er speichert es mit den Dateirechten `0600` unter `/data/better-auth-secret`. Das Volume bewahrt das Secret bei Neustarts und hält bestehende Sessions gültig. Wenn du das Volume löschst, erzeugt der nächste Start ein neues Secret und beendet damit alle bestehenden Sessions.

Setze in Produktion ein dauerhaftes Secret aus dem Secret-Store der Plattform:

```bash
docker run --rm \
  -p 3000:3000 \
  -v alpakalypse-data:/data \
  -e BETTER_AUTH_URL=https://alpaka.example.com \
  -e BETTER_AUTH_SECRET \
  alpakalypse-now
```

Ein gesetztes `BETTER_AUTH_SECRET` hat Vorrang vor der Datei im Volume. Der Entrypoint gibt automatisch erzeugte Secrets nicht aus.

### Demo-Daten abschalten

Setze `SKIP_DATABASE_SEED=true`, um keine Demo-Daten anzulegen. Die Migrationen laufen weiterhin:

```bash
docker run --rm \
  -p 3000:3000 \
  -v alpakalypse-data:/data \
  -e SKIP_DATABASE_SEED=true \
  alpakalypse-now
```

### Multi-Arch-Image veröffentlichen

Der Push baut Images für `linux/amd64` und `linux/arm64`. Anschließend veröffentlicht er beide Architekturen unter demselben Registry-Tag:

```bash
vp run docker:push
```

Mit `IMAGE_REPOSITORY`, `IMAGE_TAG` und `MULTIARCH_BUILDER` kannst du Repository, Tag und Buildx-Builder ändern.

## Demo-Zugänge

| Rolle | E-Mail                   | Passwort      |
| ----- | ------------------------ | ------------- |
| Admin | `admin@alpakalypse.demo` | `Flausch123!` |
| Kunde | `kunde@alpakalypse.demo` | `Flausch123!` |

Verwende nur Demo-Daten. Die Anwendung verarbeitet keine Zahlungen und versendet keine E-Mails.

## Entwicklung und Tests

| Befehl                    | Zweck                                                   |
| ------------------------- | ------------------------------------------------------- |
| `vp run db:generate`      | Erzeugt eine Migration aus dem Drizzle-Schema.          |
| `vp run db:migrate`       | Wendet ausstehende Migrationen an.                      |
| `vp run db:seed`          | Legt die Demo-Daten an.                                 |
| `vp check`                | Formatiert den Code und prüft Lint sowie Typen.         |
| `vp run test:unit`        | Führt die Unit-Tests aus.                               |
| `vp run test:integration` | Führt die Integrationstests mit SQLite im Speicher aus. |
| `vp run test:coverage`    | Erstellt einen Coverage-Bericht ohne Mindestwert.       |
| `vp run test:e2e:install` | Installiert Chromium für die Browser-Tests.             |
| `vp run test:e2e`         | Führt die Browser-Tests aus.                            |
| `vp run test:all`         | Führt Unit-, Integrations- und Browser-Tests aus.       |
| `vp build`                | Erstellt den Produktions-Build.                         |

Die Browser-Tests verwenden nur `.test-data/e2e.db`. Die Tests setzen diese Datenbank vor jedem Lauf zurück und ändern die lokale Entwicklungsdatenbank nicht. Bei Fehlern schreibt Playwright Berichte nach `playwright-report` und weitere Dateien nach `test-results`.

## CI

Eine CI-Pipeline sollte diese Befehle ausführen:

```bash
vp install --frozen-lockfile
vp run test:e2e:install
vp check
vp run test:coverage
vp build
vp run test:e2e
```

Veröffentliche die Coverage-Berichte sowie `playwright-report` und `test-results` als Build-Artefakte.
