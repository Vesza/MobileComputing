import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Platform } from "react-native";
import { auth, db } from "../services/FirebaseConfig";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { cancelScheduledAsync } from "../services/notify";
import ConfirmModal from "../components/ConfirmModal";

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

export default function RemindersScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title, scheduledId } | null
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "reminders"),
      orderBy("startsAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title ?? "(ohne Text)",
            startsAt: data.startsAt?.toDate ? data.startsAt.toDate() : null,
            durationSec: typeof data.durationSec === "number" ? data.durationSec : 10,
            scheduledId: typeof data.scheduledId === "string" ? data.scheduledId : null,
          };
        });

        setItems(list);
      },
      (err) => console.log("Reminders snapshot error:", err)
    );

    return unsub;
  }, []);

  const empty = useMemo(() => items.length === 0, [items]);

  const openDeletePopup = useCallback((it) => {
    setDeleteTarget({ id: it.id, title: it.title, scheduledId: it.scheduledId });
  }, []);

  const closeDeletePopup = useCallback(() => {
    if (deleting) return;
    setDeleteTarget(null);
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user || !deleteTarget) return;

      setDeleting(true);

      if (deleteTarget.scheduledId) {
        await cancelScheduledAsync(deleteTarget.scheduledId);
      }

      await deleteDoc(doc(db, "users", user.uid, "reminders", deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      console.log("Delete reminder error:", e);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const openDetail = useCallback(
    (it) => {
      navigation.navigate("Detail", {
        type: "reminder",
        item: {
          id: it.id,
          title: it.title,
          startsAt: it.startsAt ? it.startsAt.toISOString() : null,
        },
      });
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders</Text>

      {empty ? (
        <Text style={styles.empty}>Noch keine Reminders vorhanden.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => openDetail(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  ⏰ {item.title}
                </Text>
                <Text style={styles.rowSub}>
                  {item.startsAt ? formatDateTime(item.startsAt) : "-"}
                </Text>
              </View>

              <Pressable
                onPress={(e) => {
                  e?.stopPropagation?.();
                  openDeletePopup(item);
                }}
                style={styles.trashPressable}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Text style={styles.trash}>🗑️</Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        title="Reminder wirklich löschen?"
        subtitle={deleteTarget?.title || ""}
        loading={deleting}
        onCancel={closeDeletePopup}
        onConfirm={confirmDelete}
      />

      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.link}>Zurück</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
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

  trashPressable: { marginLeft: 10, paddingHorizontal: 6, paddingVertical: 6 },
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
});
