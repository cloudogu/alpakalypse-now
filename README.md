# Alpakalypse Now

Demo-Anwendung für einen fiktiven Alpaka-Verleih, umgesetzt mit TanStack Start, Better Auth, Drizzle ORM und SQLite.

## Lokal starten

```bash
vp install
vp run db:setup
vp dev
```

Die SQLite-Datei wird über `DATABASE_URL` in `.env.local` konfiguriert. Falls die Variable fehlt, nutzt die App `./alpakalypse.db`.

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
vp test             # Tests
vp build            # Produktions-Build
```
