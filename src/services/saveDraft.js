// Firestore: wir schreiben neue Dokumente in die Unter-Collections des Users.
// serverTimestamp wird genutzt, damit die Zeit vom Server kommt und nicht vom Gerät.
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./FirebaseConfig";

// Scheduling für lokale Notifications.
// cancelScheduledAsync wird als Absicherung genutzt, falls Firestore schreiben fehlschlägt.
import {
  scheduleLocalReminderAsync,
  scheduleLocalNotificationAsync,
  cancelScheduledAsync,
} from "./notify";

// Datum/Time Parsing und Dauer-Absicherung.
import { clampDurationSec, toDateFromStrings } from "../utils/datetime";

// Speichert einen Draft aus dem Create-Flow.
// Für Appointments wird nur Firestore beschrieben.
// Für Reminders/Notifications wird zusätzlich eine lokale Notification geplant und die scheduledId mitgespeichert.
export async function saveDraft({ draft, uid }) {
  // Wird gesetzt, sobald wir eine lokale Notification geplant haben.
  // Falls danach Firestore fehlschlägt, können wir die Planung wieder zurückrollen.
  let scheduledId = null;

  try {
    // Ohne eingeloggten User können wir nicht speichern, weil der Pfad users/{uid}/... fehlt.
    if (!uid) {
      return { ok: false, reason: "not_logged_in", toast: "Nicht eingeloggt." };
    }

    // Defensive Defaults, damit die Funktion auch bei undefiniertem draft stabil bleibt.
    const safeDraft = draft ?? { kind: "appointment" };
    const kind = safeDraft.kind ?? "appointment";

    // Basisfelder aus dem Draft ziehen und sauber normalisieren.
    const title =
      typeof safeDraft.title === "string" ? safeDraft.title.trim() : "";
    const date = safeDraft.date ?? "";
    const time = safeDraft.time ?? "";

    // Dauer wird auf 1–30 Sekunden begrenzt.
    // Default ist 10s für Reminder, sonst 3s.
    const durationSec = clampDurationSec(
      safeDraft.durationSec,
      kind === "reminder" ? 10 : 3
    );

    // Optionale Felder für Termine.
    // Bei fehlendem String wird null gespeichert, damit Firestore ein sauberes Schema hat.
    const description =
      typeof safeDraft.description === "string"
        ? safeDraft.description.trim()
        : null;

    const imageUri =
      typeof safeDraft.imageUri === "string" ? safeDraft.imageUri : null;

    const audioUri =
      typeof safeDraft.audioUri === "string" ? safeDraft.audioUri : null;

    // Mindestvalidierung: Titel, Datum und Uhrzeit müssen vorhanden sein.
    if (!title || !date || !time) {
      return { ok: false, reason: "invalid_data", toast: "Ungültige Daten." };
    }

    // Aus den Strings wird ein echtes Date-Objekt gebaut.
    const when = toDateFromStrings(date, time);
    const now = new Date();

    // Für Reminder/Notifications verhindern wir Zeiten in der Vergangenheit.
    // +10s Puffer, damit es nicht knapp an "jetzt" scheitert.
    if (
      (kind === "reminder" || kind === "notification") &&
      when.getTime() <= now.getTime() + 10_000
    ) {
      return {
        ok: false,
        reason: "time_in_past",
        toast: "Zeitpunkt muss in der Zukunft liegen.",
      };
    }

    // Termin: nur in Firestore schreiben, keine lokale Notification.
    if (kind === "appointment") {
      const ref = await addDoc(collection(db, "users", uid, "appointments"), {
        title,
        startsAt: Timestamp.fromDate(when),
        createdAt: serverTimestamp(),
        description,
        imageUri,
        audioUri,
      });

      return { ok: true, kind, toast: "Termin gespeichert", docId: ref.id };
    }

    // Reminder: lokale Notification planen und scheduledId zusammen mit dem Dokument speichern.
    if (kind === "reminder") {
      scheduledId = await scheduleLocalReminderAsync({
        title,
        startsAtDate: when,
        durationSec,
      });

      const ref = await addDoc(collection(db, "users", uid, "reminders"), {
        title,
        startsAt: Timestamp.fromDate(when),
        durationSec,
        scheduledId: String(scheduledId),
        createdAt: serverTimestamp(),
      });

      return { ok: true, kind, toast: "Reminder gespeichert", docId: ref.id };
    }

    // Notification: ebenfalls lokal planen, aber Body/Text kommt aus title.
    // In Firestore wird unter notifications gespeichert, damit Listen/Queries sauber getrennt sind.
    scheduledId = await scheduleLocalNotificationAsync({
      text: title,
      fireAtDate: when,
      durationSec,
    });

    const ref = await addDoc(collection(db, "users", uid, "notifications"), {
      text: title,
      fireAt: Timestamp.fromDate(when),
      durationSec,
      scheduledId: String(scheduledId),
      createdAt: serverTimestamp(),
    });

    return { ok: true, kind, toast: "Notification gespeichert", docId: ref.id };
  } catch (e) {
    console.log("saveDraft error:", e);

    // Falls die lokale Notification bereits geplant wurde, aber Firestore dann scheitert,
    // räumen wir auf, damit nicht später eine "verwaiste" Notification ausgelöst wird.
    try {
      if (scheduledId) await cancelScheduledAsync(scheduledId);
    } catch {}

    return { ok: false, reason: "exception", toast: "Speichern fehlgeschlagen." };
  }
}
