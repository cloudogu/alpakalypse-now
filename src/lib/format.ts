const DAY_MS = 86_400_000;

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

export function rentalDays(startDate: string, endDate: string) {
  return Math.round(
    (new Date(`${endDate}T00:00:00Z`).getTime() - new Date(`${startDate}T00:00:00Z`).getTime()) /
      DAY_MS,
  );
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
