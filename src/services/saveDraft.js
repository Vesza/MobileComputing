import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./FirebaseConfig";
import {
  scheduleLocalReminderAsync,
  scheduleLocalNotificationAsync,
  cancelScheduledAsync,
} from "./notify";
import { clampDurationSec, toDateFromStrings } from "../utils/datetime";

/**
 * Saves a create-flow draft to Firestore and schedules local notifications when needed.
 *
 * @param {object} params
 * @param {object} params.draft - draft object from create flow
 * @param {string} params.uid - firebase auth user uid
 * @returns {Promise<{ ok: true, kind: string, toast: string, docId?: string } | { ok: false, reason: string, toast: string }>}
 */
export async function saveDraft({ draft, uid }) {
  let scheduledId = null;

  try {
    if (!uid) {
      return { ok: false, reason: "not_logged_in", toast: "Nicht eingeloggt." };
    }

    const safeDraft = draft ?? { kind: "appointment" };
    const kind = safeDraft.kind ?? "appointment";

    const title =
      typeof safeDraft.title === "string" ? safeDraft.title.trim() : "";
    const date = safeDraft.date ?? "";
    const time = safeDraft.time ?? "";

    const durationSec = clampDurationSec(
      safeDraft.durationSec,
      kind === "reminder" ? 10 : 3
    );

    const description =
      typeof safeDraft.description === "string"
        ? safeDraft.description.trim()
        : null;

    const imageUri =
      typeof safeDraft.imageUri === "string" ? safeDraft.imageUri : null;

    const audioUri =
      typeof safeDraft.audioUri === "string" ? safeDraft.audioUri : null;

    if (!title || !date || !time) {
      return { ok: false, reason: "invalid_data", toast: "Ungültige Daten." };
    }

    const when = toDateFromStrings(date, time);
    const now = new Date();


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

    // notification
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

    // rollback local schedule if firestore write failed after scheduling
    try {
      if (scheduledId) await cancelScheduledAsync(scheduledId);
    } catch {}

    return { ok: false, reason: "exception", toast: "Speichern fehlgeschlagen." };
  }
}
