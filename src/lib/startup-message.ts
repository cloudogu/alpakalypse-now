export const ALPAKALYPSE_BANNER = [
  "╭──────────────────────────╮",
  "│ 🦙  ALPAKALYPSE NOW      │",
  "│     Flausch wird geladen │",
  "╰──────────────────────────╯",
].join("\n");

export const ALPACA_FUN_FACTS = [
  "Alpakas summen, wenn sie neugierig, zufrieden oder ein bisschen skeptisch sind.",
  "Alpakas spucken meist nur untereinander – Menschen sind selten das Ziel der flauschigen Artillerie.",
  "Eine Alpaka-Herde benutzt oft einen gemeinsamen Misthaufen. Ordnung muss schließlich sein.",
  "Alpakas haben keine oberen Schneidezähne – ihr Lächeln bleibt trotzdem unwiderstehlich.",
  "Alpaka-Füße haben weiche Sohlen statt Hufe. Praktisch: eingebaute Flausch-Sneaker.",
  "Neugierige Alpakas machen einen langen Hals. Der Fachbegriff lautet vermutlich Flausch-Periskop.",
  "Alpakas kommunizieren auch mit ihren Ohren. Nach hinten angelegt heißt ungefähr: Heute lieber kein Selfie.",
  "Alpaka-Wolle heißt Vlies und ist besonders warm – die Tiere tragen also ganzjährig Premium-Strickware.",
  "Ein junges Alpaka heißt Cria. Klingt niedlich, sieht noch niedlicher aus.",
  "Alpakas können im Stehen dösen. Effizienter war ein Powernap nie.",
] as const;

export function getRandomAlpacaFunFact(random = Math.random): string {
  const index = Math.floor(random() * ALPACA_FUN_FACTS.length);

  return ALPACA_FUN_FACTS[index] ?? ALPACA_FUN_FACTS[0];
}
