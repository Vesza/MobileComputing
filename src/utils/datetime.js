// Formatiert ein Date-Objekt in das Format "dd.mm.yyyy".
// padStart sorgt dafür, dass Tag und Monat immer zweistellig sind.
export function formatDDMMYYYY(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// Formatiert ein Date-Objekt in das Format "hh:mm".
// Stunden und Minuten werden ebenfalls immer zweistellig ausgegeben.
export function formatHHMM(date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Baut aus Datum "dd.mm.yyyy" und Uhrzeit "hh:mm" ein Date-Objekt.
// Wichtig: Month ist in JavaScript 0-basiert, daher mm - 1.
export function toDateFromStrings(ddmmyyyy, hhmm) {
  const [dd, mm, yyyy] = ddmmyyyy.split(".").map((x) => parseInt(x, 10));
  const [hh, min] = hhmm.split(":").map((x) => parseInt(x, 10));
  return new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
}

// Begrenzt eine Dauer auf einen sinnvollen Bereich.
// Wenn n nicht als Zahl verwendbar ist, wird fallback genutzt.
export function clampDurationSec(n, fallback = 3) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(1, Math.min(30, Math.floor(x)));
}
