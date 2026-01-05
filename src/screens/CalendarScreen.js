import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
} from "react-native";
import { auth, db } from "../services/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

function formatDateHeader(d) {
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatTime(d) {
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarScreen({ goBack, goHome }) {
  const [items, setItems] = useState([]);

  // Popup state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title } oder null
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "appointments"),
      orderBy("startsAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title ?? "(ohne Titel)",
              startsAt: data.startsAt?.toDate ? data.startsAt.toDate() : null,
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
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const key = it.startsAt.toDateString();
      if (!map.has(key)) map.set(key, { date: it.startsAt, items: [] });
      map.get(key).items.push(it);
    }
    return Array.from(map.values()).sort((a, b) => a.date - b.date);
  }, [items]);

  const openDeletePopup = (it) => {
    setDeleteTarget({ id: it.id, title: it.title });
  };

  const closeDeletePopup = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !deleteTarget) return;

      setDeleting(true);

      await deleteDoc(doc(db, "users", user.uid, "appointments", deleteTarget.id));

      setDeleteTarget(null);
    } catch (e) {
      console.log("Delete appointment error:", e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kalender</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {grouped.length === 0 ? (
          <Text style={styles.empty}>Noch keine Termine vorhanden.</Text>
        ) : (
          grouped.map((g) => (
            <View key={g.date.toDateString()} style={styles.group}>
              <Text style={styles.groupHeader}>{formatDateHeader(g.date)}</Text>

              {g.items.map((it) => (
                <View key={it.id} style={styles.row}>
                  <Text style={styles.time}>{formatTime(it.startsAt)}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.subject} numberOfLines={2}>
                    {it.title}
                  </Text>

                  {/* Mülltonne rechts */}
                  <Pressable
                    onPress={() => openDeletePopup(it)}
                    style={styles.trashPressable}
                    hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                  >
                    <Text style={styles.trash}>🗑️</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Popup Overlay */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={closeDeletePopup}
      >
        {/* Hintergrund abdunkeln + click außerhalb = schließen */}
        <Pressable style={styles.modalBackdrop} onPress={closeDeletePopup}>
          {/* Box in der Mitte; stoppt das Schließen wenn man in die Box tippt */}
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Termin wirklich löschen?</Text>

            <Text style={styles.modalSubtitle} numberOfLines={2}>
              {deleteTarget?.title || ""}
            </Text>

            <View style={{ height: 14 }} />

            {/* Reihe: Ja / Nein */}
            <View style={styles.modalButtonsRow}>
              <Pressable
                onPress={confirmDelete}
                disabled={deleting}
                style={[
                  styles.modalBtn,
                  styles.modalBtnDanger,
                  styles.modalBtnLeft,
                  deleting && styles.modalBtnDisabled,
                ]}
              >
                <Text style={styles.modalBtnTextWhite}>
                  {deleting ? "Lösche..." : "Ja"}
                </Text>
              </Pressable>

              <Pressable
                onPress={closeDeletePopup}
                disabled={deleting}
                style={[
                  styles.modalBtn,
                  styles.modalBtnNeutral,
                  deleting && styles.modalBtnDisabled,
                ]}
              >
                <Text style={styles.modalBtnTextDark}>Nein</Text>
              </Pressable>
            </View>

            <View style={{ height: 10 }} />

            {/* Abbrechen als volle Breite */}
            <Pressable
              onPress={closeDeletePopup}
              disabled={deleting}
              style={[
                styles.modalBtn,
                styles.modalBtnNeutral,
                styles.modalBtnFull,
                deleting && styles.modalBtnDisabled,
              ]}
            >
              <Text style={styles.modalBtnTextDark}>Abbrechen</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* unten links und unten rechts: großer unsichtbarer Button hinter den Texten */}
      <Pressable
        onPress={goBack}
        style={[styles.bottomPressable, styles.left]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Zurück</Text>
      </Pressable>

      <Pressable
        onPress={goHome}
        style={[styles.bottomPressable, styles.right]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Welcome</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },

  scroll: { paddingBottom: 220 },

  empty: { color: "grey", marginTop: 30, textAlign: "center" },

  group: { marginBottom: 18 },
  groupHeader: { color: "grey", textDecorationLine: "underline", marginBottom: 8 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  time: { width: 60, color: "grey", fontWeight: "bold" },
  divider: { width: 1, height: 24, backgroundColor: "#ddd", marginHorizontal: 10 },
  subject: { flex: 1, fontSize: 16 },

  trashPressable: {
    marginLeft: 10,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  trash: { fontSize: 18 },

  bottomPressable: {
    position: "absolute",
    bottom: BOTTOM_OFFSET,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },
  bottomLinkText: { color: "grey", textDecorationLine: "underline" },
  left: { left: 10 },
  right: { right: 10, alignItems: "flex-end" },

  // Modal
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
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: { color: "grey", textAlign: "center" },

  modalButtonsRow: {
    flexDirection: "row",
  },

  modalBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    flex: 1,
  },
  modalBtnLeft: { marginRight: 10 },
  modalBtnFull: { flex: 0, width: "100%" },

  modalBtnDanger: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  modalBtnNeutral: {
    backgroundColor: "#f2f2f2",
    borderColor: "#ddd",
  },
  modalBtnDisabled: { opacity: 0.6 },

  modalBtnTextWhite: { color: "white", fontWeight: "bold" },
  modalBtnTextDark: { color: "#333", fontWeight: "bold" },
});
