import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/FirebaseConfig";
import { cancelScheduledAsync } from "../services/notify";
import ConfirmModal from "../components/ConfirmModal";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();

  const [items, setItems] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null); // { id, text, scheduledId } 
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      return;
    }

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
  }, [user?.uid]);

  const empty = useMemo(() => items.length === 0, [items]);

  const openDeletePopup = useCallback((it) => {
    setDeleteTarget({ id: it.id, text: it.text, scheduledId: it.scheduledId });
  }, []);

  const closeDeletePopup = useCallback(() => {
    if (deleting) return;
    setDeleteTarget(null);
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    try {
      if (!user?.uid || !deleteTarget) return;

      setDeleting(true);

      if (deleteTarget.scheduledId) {
        await cancelScheduledAsync(deleteTarget.scheduledId);
      }

      await deleteDoc(doc(db, "users", user.uid, "notifications", deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      console.log("Delete notification error:", e);
    } finally {
      setDeleting(false);
    }
  }, [user?.uid, deleteTarget]);

  const openDetail = useCallback(
    (it) => {
      navigation.navigate("Detail", {
        type: "notification",
        item: {
          id: it.id,
          text: it.text,
          fireAt: it.fireAt ? it.fireAt.toISOString() : null,
        },
      });
    },
    [navigation]
  );

  return (
    <View
      style={[
        UI.screen,
        {
          paddingTop: LAYOUT.offsets.top,
          paddingBottom: LAYOUT.offsets.bottom,
        },
      ]}
    >
      <Text style={styles.title}>Notifications</Text>

      {empty ? (
        <Text style={styles.empty}>Noch keine Notifications vorhanden.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ paddingBottom: 120 + LAYOUT.offsets.bottom }}
          renderItem={({ item }) => (
            <Pressable style={[UI.bordered, styles.row]} onPress={() => openDetail(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={3}>
                   {item.text}
                </Text>
                <Text style={styles.rowSub}>
                  {item.fireAt ? formatDateTime(item.fireAt) : "-"}
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
        title="Notification wirklich löschen?"
        subtitle={deleteTarget?.text || ""}
        loading={deleting}
        onCancel={closeDeletePopup}
        onConfirm={confirmDelete}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 12,
    color: COLORS.text,
  },
  empty: { color: COLORS.textMuted, marginTop: 30, textAlign: "center" },

  row: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
  },
  rowTitle: { fontWeight: FONT_WEIGHT.bold, marginBottom: 6, color: COLORS.text },
  rowSub: { color: COLORS.textMuted },

  trashPressable: { marginLeft: 10, paddingHorizontal: 6, paddingVertical: 6 },
  trash: { fontSize: 18 },

  back: {
    position: "absolute",
    left: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },
  link: { color: COLORS.textMuted, textDecorationLine: "underline" },
});
