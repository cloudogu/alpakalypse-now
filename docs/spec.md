# Spec: Alpakalypse Now – MVP + Nutzer & Verwaltung

**Claim:** _"Wenn's flauschig eskalieren soll."_
**Stack:** TanStack Start · Drizzle ORM · SQLite
**Zweck:** Reine Demo-Anwendung (kein produktiver Einsatz, keine echten Zahlungen/Personendaten)

---

## 1. Ziel & Scope

Ziel ist eine funktionsfähige Demo-Webapp, die einen fiktiven Alpaka-Verleih abbildet. Der Scope dieser Spec umfasst:

- **MVP:** Katalog, Detailseite, Buchung, Verfügbarkeitskalender, Bestätigung
- **Nutzer & Verwaltung:** Auth, Kundenprofil, Admin-Dashboard, Rollenmodell

Nicht enthalten (spätere Iteration): Spielerische Zusatz-Features, echte Payments, E-Mail-Versand, i18n.

---

## 2. Datenmodell (Drizzle Schema, konzeptionell)

### `users`

| Feld         | Typ                       | Anmerkung          |
| ------------ | ------------------------- | ------------------ |
| id           | text/uuid, PK             |                    |
| email        | text, unique              |                    |
| passwordHash | text                      |                    |
| name         | text                      |                    |
| role         | enum('customer', 'admin') | default `customer` |
| createdAt    | timestamp                 |                    |

### `alpacas`

| Feld      | Typ                         | Anmerkung                                            |
| --------- | --------------------------- | ---------------------------------------------------- |
| id        | text/uuid, PK               |                                                      |
| name      | text                        | z. B. "Kevin"                                        |
| bio       | text                        | witziger Steckbrief-Text                             |
| furColor  | text                        |                                                      |
| spitRisk  | enum('low','medium','high') | optional, aber schon vorgesehen für spätere Features |
| dailyRate | integer (Cent)              |                                                      |
| imageUrl  | text, nullable              |                                                      |
| active    | boolean                     | default `true` (Soft-Delete statt Hard-Delete)       |
| createdAt | timestamp                   |                                                      |

### `bookings`

| Feld       | Typ                           | Anmerkung                |
| ---------- | ----------------------------- | ------------------------ |
| id         | text/uuid, PK                 |                          |
| userId     | FK → users.id                 |                          |
| alpacaId   | FK → alpacas.id               |                          |
| startDate  | date                          |                          |
| endDate    | date                          |                          |
| status     | enum('confirmed','cancelled') |                          |
| totalPrice | integer (Cent)                | berechnet bei Erstellung |
| createdAt  | timestamp                     |                          |

**Constraint:** Keine Überlappung von `bookings` mit `status='confirmed'` für dasselbe `alpacaId` im gleichen Zeitraum (Validierung serverseitig, kein DB-Constraint nötig für Demo).

---

## 3. Routing-Struktur (TanStack Start)

```
/                          → Startseite (Hero + Alpaka-Auswahl-Teaser)
/alpacas                   → Katalog (Liste + einfache Filter)
/alpacas/$alpacaId         → Detailseite + Kalender + "Jetzt buchen"
/booking/$alpacaId         → Buchungsformular (Zeitraum wählen)
/booking/confirmation/$id  → Bestätigungsseite nach Buchung
/login                     → Login
/register                  → Registrierung
/profile                   → Kundenprofil (eigene Buchungen)
/admin                     → Admin-Dashboard (nur role=admin)
/admin/alpacas             → CRUD-Liste Alpakas
/admin/alpacas/new         → Alpaka anlegen
/admin/alpacas/$id/edit    → Alpaka bearbeiten
/admin/bookings            → Alle Buchungen verwalten (Admin)
```

Routen unter `/admin/*` und `/profile` sind auth-geschützt (Loader-Guard via Session-Check).

---

## 4. Feature-Spezifikation

### 4.1 Alpaka-Katalog (`/alpacas`)

- Zeigt alle `alpacas` mit `active=true`
- Karte pro Alpaka: Bild, Name, Fell-Farbe, Tagesmiete
- Einfache Filter: nach Fell-Farbe, Preis-Range (optional für MVP, sonst Backlog)
- Klick → Detailseite

### 4.2 Alpaka-Detailseite (`/alpacas/$alpacaId`)

- Vollständiger Steckbrief (Bio, Fell-Farbe, Tagesmiete, Foto)
- Verfügbarkeitskalender: zeigt bereits gebuchte Zeiträume (read-only Kalenderansicht, z. B. blockierte Tage grau)
- CTA "Jetzt buchen" → führt zu `/booking/$alpacaId`
- Nicht eingeloggte Nutzer werden beim Klick auf "Jetzt buchen" zu `/login` weitergeleitet (mit Redirect-Back)

### 4.3 Verleih-Buchung (`/booking/$alpacaId`)

- Formular: Start-/Enddatum (Datepicker)
- Serverseitige Validierung:
  - Zeitraum liegt in der Zukunft
  - Enddatum > Startdatum
  - Keine Überlappung mit bestehender `confirmed`-Buchung desselben Alpakas
- Live-Preisberechnung: `totalPrice = dailyRate * Anzahl Tage`
- Bei Absenden: Server Function erstellt `booking` mit `status='confirmed'`
- Redirect zu `/booking/confirmation/$id`

### 4.4 Buchungsbestätigung (`/booking/confirmation/$id`)

- Zusammenfassung: Alpaka-Name, Zeitraum, Gesamtpreis, Buchungs-ID
- Fiktiver "Rechnungs"-Hinweis (Text, kein echtes PDF im MVP)
- Link zurück zu `/profile`

### 4.5 Auth (Login/Registrierung)

- **Registrierung** (`/register`): E-Mail, Passwort, Name → erstellt `user` mit `role='customer'`
- **Login** (`/login`): E-Mail + Passwort → Session-Cookie
- Passwort-Hashing serverseitig (z. B. bcrypt/argon2)
- Kein Passwort-Reset-Flow im MVP (Demo-Scope)
- Logout-Funktion (Session invalidieren)

### 4.6 Kundenprofil (`/profile`)

- Zeigt eingeloggten Nutzer: Name, E-Mail
- Liste eigener Buchungen (aktuelle + vergangene), sortiert nach Datum
- Pro Buchung: Alpaka-Name, Zeitraum, Status, Preis
- Optional: Buchung stornieren (Status → `cancelled`), wenn Startdatum noch in der Zukunft liegt

### 4.7 Admin-Dashboard (`/admin`)

- Nur zugänglich für `role='admin'`
- Übersicht: Anzahl Alpakas, Anzahl aktiver Buchungen (einfache Kennzahlen-Kacheln)
- Navigation zu `/admin/alpacas` und `/admin/bookings`

### 4.8 Alpaka-Verwaltung (`/admin/alpacas`)

- Tabelle aller Alpakas (inkl. inaktive)
- Aktionen: Bearbeiten, Deaktivieren (Soft-Delete), Neu anlegen
- Formular (`new`/`edit`): Name, Bio, Fell-Farbe, Tagesmiete, Bild-URL/Upload, Spuckrisiko

### 4.9 Buchungsverwaltung (`/admin/bookings`)

- Tabelle aller Buchungen, mit Filter nach Status
- Anzeige: Kunde, Alpaka, Zeitraum, Preis, Status
- Aktion: Buchung stornieren (Admin-Override)

### 4.10 Rollenmodell

- Zwei Rollen: `customer`, `admin`
- Middleware/Loader-Guard prüft Rolle vor Zugriff auf `/admin/*`
- Kein UI zur Rollenvergabe im MVP – erster Admin wird per Seed-Script gesetzt

---

## 5. Nicht-funktionale Anforderungen (Demo-Kontext)

- **Kein echtes Payment**, nur Preisanzeige/-berechnung
- **Kein echter E-Mail-Versand**
- **Seeding-Script** erzeugt Demo-Daten: ~8–10 Alpakas, 1 Admin-User, ein paar Beispielbuchungen
- Session-Handling einfach halten (z. B. Cookie-basiert, kein OAuth nötig)
- Fokus auf Lesbarkeit/Showcase-Charakter des Codes, nicht auf Production-Hardening

---

## 6. Offene Punkte / Annahmen zur Klärung

- Soll Bild-Upload real funktionieren (lokales Filesystem/Base64 in SQLite) oder reichen im MVP feste Bild-URLs?
- Soll Stornierung durch Kunden möglich sein, oder nur Admin-seitig?
- Reicht Cookie-Session-Auth, oder soll es ein bestehendes Auth-Lib (z. B. Lucia, better-auth) sein?
