import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Modal, Platform } from "react-native";
import { auth, db } from "../services/FirebaseConfig";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { cancelScheduledAsync } from "../services/notify";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

function formatDateTime(d) {
  return d.toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);

  // Delete popup state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, text, scheduledId } | null
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("fireAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text ?? "",
            fireAt: data.fireAt?.toDate ? data.fireAt.toDate() : null,
            durationSec: typeof data.durationSec === "number" ? data.durationSec : 3,
            scheduledId: typeof data.scheduledId === "string" ? data.scheduledId : null,
          };
        });
        setItems(list);
      },
      (err) => console.log("Notifications snapshot error:", err)
    );

    return unsub;
  }, []);

  const empty = useMemo(() => items.length === 0, [items]);

  const openDeletePopup = (it) => {
    setDeleteTarget({
      id: it.id,
      text: it.text,
      scheduledId: it.scheduledId,
    });
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

      // 1) cancel scheduled local notification if id exists
      if (deleteTarget.scheduledId) {
        await cancelScheduledAsync(deleteTarget.scheduledId);
      }

      // 2) delete firestore doc
      await deleteDoc(doc(db, "users", user.uid, "notifications", deleteTarget.id));

      setDeleteTarget(null);
    } catch (e) {
      console.log("Delete notification error:", e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <Pressable
        style={styles.addBtn}
        onPress={() => navigation.navigate("NotificationCreateText")}
      >
        <Text style={styles.addBtnText}>+ Neue Notification</Text>
      </Pressable>

      {empty ? (
        <Text style={styles.empty}>Noch keine Notifications vorhanden.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={3}>
                  ❗ {item.text}
                </Text>
                <Text style={styles.rowSub}>
                  {item.fireAt ? formatDateTime(item.fireAt) : "-"} · Vibration: {item.durationSec}s
                </Text>
              </View>

              <Pressable
                onPress={() => openDeletePopup(item)}
                style={styles.trashPressable}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Text style={styles.trash}>🗑️</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Delete popup */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={closeDeletePopup}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeDeletePopup}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Notification wirklich löschen?</Text>

            <Text style={styles.modalSubtitle} numberOfLines={2}>
              {deleteTarget?.text || ""}
            </Text>

            <View style={{ height: 14 }} />

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

      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.link}>Zurück</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },

  addBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  addBtnText: { fontWeight: "800" },

  empty: { color: "grey", marginTop: 30, textAlign: "center" },

  row: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
  },
  rowTitle: { fontWeight: "800", marginBottom: 6 },
  rowSub: { color: "grey" },

  trashPressable: {
    marginLeft: 10,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  trash: { fontSize: 18 },

  back: {
    position: "absolute",
    left: 10,
    bottom: BOTTOM_OFFSET,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },
  link: { color: "grey", textDecorationLine: "underline" },

  // Delete modal
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

  modalButtonsRow: { flexDirection: "row" },

  modalBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    flex: 1,
  },
  modalBtnLeft: { marginRight: 10 },
  modalBtnFull: { flex: 0, width: "100%" },

  modalBtnDanger: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  modalBtnNeutral: { backgroundColor: "#f2f2f2", borderColor: "#ddd" },
  modalBtnDisabled: { opacity: 0.6 },

  modalBtnTextWhite: { color: "white", fontWeight: "bold" },
  modalBtnTextDark: { color: "#333", fontWeight: "bold" },
});
