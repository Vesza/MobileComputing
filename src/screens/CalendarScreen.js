// React wird für die Komponente benötigt, Hooks steuern State, Berechnungen und Callbacks.
// View/Text/Pressable/Modal/SectionList sind UI-Bausteine für Liste und Lösch-Dialog.
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  SectionList,
} from "react-native";

// Firestore-Funktionen für Live-Updates und Löschen.
// query/where/orderBy bauen die Abfrage, onSnapshot liefert Änderungen in Echtzeit.
// Timestamp wird genutzt, um Date-Objekte als Firestore-Timestamp zu vergleichen.
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/FirebaseConfig";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";
import { useAuth } from "../context/AuthContext";

// Hilfsfunktion: setzt eine Zeit auf Tagesanfang, damit Gruppierung und Filter sauber funktionieren.
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Formatiert das Datum für die Überschrift einer Section in der SectionList.
function formatDateHeader(d) {
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Formatiert eine Uhrzeit für die Anzeige in der Terminzeile.
function formatTime(d) {
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarScreen({ navigation }) {
  // uid wird für den Firestore-Pfad benötigt.
  const { user } = useAuth();

  // Abstände werden aus Layout-Konstanten übernommen, damit es auf iOS/Android passt.
  const bottomPadding = LAYOUT.offsets.bottom;
  const topPadding = LAYOUT.offsets.top;

  // items hält die geladenen Termine aus Firestore.
  const [items, setItems] = useState([]);

  // deleteTarget enthält das Element, das gerade gelöscht werden soll.
  // deleting sperrt die Buttons während der Löschaktion.
  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [deleting, setDeleting] = useState(false);

  // Live-Abfrage: lädt alle Termine ab heute und hört auf Änderungen.
  // Wenn kein User vorhanden ist, wird die Liste geleert.
  // Rückgabe von unsub sorgt dafür, dass der Listener beim Verlassen des Screens entfernt wird.
  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      return;
    }

    const today0 = startOfDay(new Date());

    const q = query(
      collection(db, "users", user.uid, "appointments"),
      where("startsAt", ">=", Timestamp.fromDate(today0)),
      orderBy("startsAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title ?? "(ohne Titel)",
              startsAt: data.startsAt?.toDate ? data.startsAt.toDate() : null,
              imageUri: typeof data.imageUri === "string" ? data.imageUri : null,
              description:
                typeof data.description === "string" ? data.description : null,
              audioUri: typeof data.audioUri === "string" ? data.audioUri : null,
            };
          })
          .filter((x) => x.startsAt);

        setItems(list);
      },
      (err) => {
        console.log("Calendar snapshot error:", err);
      }
    );

    return unsub;
  }, [user?.uid]);

  // Aus items werden Sections gebaut, damit Termine nach Tagen gruppiert dargestellt werden.
  // Map sammelt alle Termine pro Tag, danach werden Tage und Termine sortiert.
  const sections = useMemo(() => {
    const map = new Map();

    for (const it of items) {
      const day0 = startOfDay(it.startsAt);
      const key = day0.toISOString();
      if (!map.has(key)) map.set(key, { date: day0, data: [] });
      map.get(key).data.push(it);
    }

    const arr = Array.from(map.values()).sort((a, b) => a.date - b.date);
    for (const s of arr) {
      s.data.sort((a, b) => a.startsAt - b.startsAt);
    }

    return arr.map((s) => ({
      title: formatDateHeader(s.date),
      date: s.date,
      data: s.data,
    }));
  }, [items]);

  // Öffnet den Lösch-Dialog für einen Termin.
  const openDeletePopup = useCallback((it) => {
    setDeleteTarget({ id: it.id, title: it.title });
  }, []);

  // Schließt den Lösch-Dialog, außer gerade läuft ein Delete.
  const closeDeletePopup = useCallback(() => {
    if (deleting) return;
    setDeleteTarget(null);
  }, [deleting]);

  // Löscht das ausgewählte Dokument aus Firestore.
  // Währenddessen wird deleting gesetzt, damit keine Doppelaktionen passieren.
  const confirmDelete = useCallback(async () => {
    try {
      if (!user?.uid || !deleteTarget) return;

      setDeleting(true);
      await deleteDoc(
        doc(db, "users", user.uid, "appointments", deleteTarget.id)
      );
      setDeleteTarget(null);
    } catch (e) {
      console.log("Delete appointment error:", e);
    } finally {
      setDeleting(false);
    }
  }, [user?.uid, deleteTarget]);

  // Öffnet die Detailansicht und übergibt die Daten im erwarteten Format.
  // startsAt wird als ISO-String übergeben, damit es auf der Detailseite wieder als Date geparst werden kann.
  const openDetail = useCallback(
    (item) => {
      navigation.navigate("Detail", {
        type: "appointment",
        item: {
          id: item.id,
          title: item.title,
          startsAt: item.startsAt ? item.startsAt.toISOString() : null,
          description: item.description ?? null,
          imageUri: item.imageUri ?? null,
          audioUri: item.audioUri ?? null,
        },
      });
    },
    [navigation]
  );

  // SectionList rendert gruppiert nach Tag.
  // In jeder Zeile öffnet ein Tap die Detailansicht.
  // Ein LongPress oder der ⋯-Button öffnet den Löschdialog.
  // Wenn keine Termine vorhanden sind, wird ein Hinweis angezeigt.
  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPadding, paddingBottom: bottomPadding },
      ]}
    >
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={[UI.bordered, styles.row]}>
       
            <Pressable
              style={styles.rowMain}
              onPress={() => openDetail(item)}
              onLongPress={() => openDeletePopup(item)} // power-user shortcut
            >
              <Text style={styles.time}>{formatTime(item.startsAt)}</Text>
              <View style={styles.divider} />
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>

      
            <Pressable
              style={styles.moreBtn}
              onPress={() => openDeletePopup(item)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Mehr Optionen"
            >
              <Text style={styles.moreBtnText}>⋯</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Keine Termine vorhanden.</Text>
        }
      />

      {/* Modal wird angezeigt, sobald deleteTarget gesetzt ist.
          Tap außerhalb schließt den Dialog, außer während eines laufenden Deletes. */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={closeDeletePopup}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeDeletePopup}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Termin löschen?</Text>
            <Text style={styles.modalSubtitle}>{deleteTarget?.title}</Text>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={confirmDelete}
                disabled={deleting}
                style={[styles.modalBtn, styles.modalBtnDanger]}
              >
                <Text style={styles.modalBtnTextWhite}>
                  {deleting ? "Lösche..." : "Ja"}
                </Text>
              </Pressable>

              <Pressable
                onPress={closeDeletePopup}
                disabled={deleting}
                style={[styles.modalBtn, styles.modalBtnNeutral]}
              >
                <Text style={styles.modalBtnTextDark}>Abbrechen</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// Styles für Layout und Darstellung der Liste.
// sectionHeader ist die Tagesüberschrift.
// row/rowMain sind die Terminzeile, moreBtn ist der ⋯-Button.
// modalBackdrop/modalBox und die Button-Styles steuern das Aussehen des Löschdialogs.
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },

  sectionHeader: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    marginVertical: 10,
    color: COLORS.text,
  },

  // row as wrapper View, rowMain is pressable area
  row: {
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  time: { width: 56, color: COLORS.textMuted, fontWeight: FONT_WEIGHT.bold },

  divider: {
    width: 1,
    height: 22,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },

  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  // menu button
  moreBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    borderRadius: 10,
  },

  moreBtnText: {
    fontSize: 22,
    lineHeight: 22,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 40,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  modalSubtitle: {
    color: "grey",
    textAlign: "center",
    marginVertical: 8,
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },

  modalBtnDanger: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },

  modalBtnNeutral: {
    backgroundColor: "#f2f2f2",
    borderColor: "#ddd",
  },

  modalBtnTextWhite: { color: "white", fontWeight: "bold" },
  modalBtnTextDark: { color: "#333", fontWeight: "bold" },
});
