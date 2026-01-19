import React, { useMemo, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ScrollView,
  Platform,
} from "react-native";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;
const TOP_OFFSET = Platform.OS === "android" ? 52 : 62;

function parseStartsAt(startsAt) {
  if (!startsAt) return null;
  const d = new Date(startsAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateParts(d) {
  const date = d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

export default function AppointmentDetailScreen({ navigation, route }) {
  const item = route?.params?.item;
  const [previewUri, setPreviewUri] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const startsAtDate = useMemo(() => parseStartsAt(item?.startsAt), [item?.startsAt]);
  const pretty = useMemo(() => {
    if (!startsAtDate) return { date: "-", time: "-" };
    return formatDateParts(startsAtDate);
  }, [startsAtDate]);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Termin</Text>
        <Text style={styles.muted}>Kein Termin übergeben.</Text>

        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Zurück</Text>
        </Pressable>
      </View>
    );
  }

  const title = (item.title || "").trim() || "(ohne Titel)";
  const description = typeof item.description === "string" ? item.description.trim() : "";
  const hasDescription = description.length > 0;
  const hasImage = typeof item.imageUri === "string" && item.imageUri.length > 0;

  return (
    <View style={styles.container}>
      {/* Titel ganz oben links */}
      <Text style={styles.headerTitle} numberOfLines={2}>
        {title}
      </Text>

      {/* darunter: Datum & Uhrzeit in "Header-Kapseln" (ohne Icons) */}
      <View style={styles.metaRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{pretty.date}</Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillText}>{pretty.time}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {hasDescription || hasImage ? (
          <View style={styles.detailsCard}>
            <View style={styles.detailsGrid}>
              {hasDescription ? (
                <View style={styles.descBox}>
                  <Text style={styles.descText}>{description}</Text>
                </View>
              ) : null}

              {hasImage ? (
                <View style={styles.imageBox}>
                  <Pressable
                    onPress={() => setPreviewUri(item.imageUri)}
                    style={styles.imagePressable}
                  >
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Text style={styles.imageOverlayText}>Tippen zum Vergrößern</Text>
                    </View>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={styles.mutedCenter}>Keine Beschreibung / kein Bild hinzugefügt.</Text>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewUri(null)}>
          <Image source={{ uri: previewUri || "" }} style={styles.previewImage} resizeMode="contain" />
        </Pressable>
      </Modal>

      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>Zurück</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: TOP_OFFSET, paddingHorizontal: 20, backgroundColor: "white" },

  headerTitle: {
    fontSize: 26,
    fontWeight: "250",
    letterSpacing: 0.2,
    marginBottom: 12,
    textAlign: "left",
  },

  metaRow: { flexDirection: "row", gap: 10, marginBottom: 16 },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  pillText: { fontSize: 14, fontWeight: "700", color: "#333" },

  scroll: { paddingBottom: 40 },

  detailsCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fafafa",
  },

  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  descBox: {
    flexGrow: 1,
    flexBasis: 240,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "white",
  },
  descText: { fontSize: 15, lineHeight: 20, color: "#222" },

  imageBox: { flexGrow: 1, flexBasis: 180 },
  imagePressable: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "white",
  },
  image: { width: "100%", height: 220 },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  imageOverlayText: { color: "white", fontSize: 12, fontWeight: "700", textAlign: "center" },

  muted: { color: "grey", marginTop: 10 },
  mutedCenter: { color: "grey", textAlign: "center", marginTop: 10 },

  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: { width: "95%", height: "95%" },

  backBtn: {
    position: "absolute",
    left: 10,
    bottom: BOTTOM_OFFSET,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },
  backText: { color: "grey", textDecorationLine: "underline" },
});
