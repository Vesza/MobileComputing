import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { UI, LAYOUT, COLORS, FONT_WEIGHT, FONT_SIZE } from "../constants";

function parseDateAny(x) {
  if (!x) return null;

  // Firestore timestamp
  if (typeof x === "object" && typeof x.toDate === "function") {
    const d = x.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }

  if (x instanceof Date) {
    return !Number.isNaN(x.getTime()) ? x : null;
  }

  if (typeof x === "string") {
    const d = new Date(x);
    return !Number.isNaN(d.getTime()) ? d : null;
  }

  return null;
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

function safeText(x, fallback = "-") {
  const t = typeof x === "string" ? x.trim() : "";
  return t.length ? t : fallback;
}

export default function DetailScreen({ navigation, route }) {
  const type = route?.params?.type; // appointment, reminder, notification
  const item = route?.params?.item;

  const [previewUri, setPreviewUri] = useState(null);

  // audio playback
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch {}
      })();
    };
  }, []);

  const normalized = useMemo(() => {
    if (!item || !type) return null;

    if (type === "appointment") {
      const startsAt = parseDateAny(item.startsAt);
      return {
        type,
        title: safeText(item.title, "(ohne Titel)"),
        datetime: startsAt,
        description: typeof item.description === "string" ? item.description.trim() : "",
        imageUri: typeof item.imageUri === "string" && item.imageUri.length ? item.imageUri : null,
        audioUri: typeof item.audioUri === "string" && item.audioUri.length ? item.audioUri : null,
      };
    }

    if (type === "reminder") {
      const startsAt = parseDateAny(item.startsAt);
      return { type, title: safeText(item.title, "(ohne Text)"), datetime: startsAt };
    }

    if (type === "notification") {
      const fireAt = parseDateAny(item.fireAt);
      return { type, title: safeText(item.text, "(ohne Text)"), datetime: fireAt };
    }

    return null;
  }, [item, type]);

  const pretty = useMemo(() => {
    if (!normalized?.datetime) return { date: "-", time: "-" };
    return formatDateParts(normalized.datetime);
  }, [normalized]);

  const headerLabel =
    normalized?.type === "appointment"
      ? "Termin"
      : normalized?.type === "reminder"
      ? "Reminder"
      : normalized?.type === "notification"
      ? "Notification"
      : "Detail";

  const stopPlayback = async () => {
    try {
      if (!soundRef.current) {
        setIsPlaying(false);
        return;
      }
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    } catch {}
    setIsPlaying(false);
  };

  const togglePlay = async () => {
    try {
      if (!normalized?.audioUri) return;

      if (isPlaying) {
        await stopPlayback();
        return;
      }

      await stopPlayback();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: normalized.audioUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st || !st.isLoaded) return;
        if (st.didJustFinish) stopPlayback();
      });
    } catch (e) {
      console.log("Detail play error:", e);
      await stopPlayback();
    }
  };

  if (!normalized) {
    return (
      <View
        style={[
          UI.screen,
          styles.screen,
          { paddingTop: LAYOUT.offsets.top, paddingBottom: LAYOUT.offsets.bottom },
        ]}
      >
        <Text style={styles.headerTitle}>Detail</Text>
        <Text style={styles.muted}>Kein Element übergeben.</Text>
      </View>
    );
  }

  const isAppointment = normalized.type === "appointment";

  return (
    <View
      style={[
        UI.screen,
        styles.screen,
        { paddingTop: LAYOUT.offsets.top, paddingBottom: LAYOUT.offsets.bottom },
      ]}
    >
      <Text style={styles.smallHeader}>{headerLabel}</Text>

<View style={styles.titleBox}>
  <Text style={styles.title} numberOfLines={2}>
    {normalized.title}
  </Text>
</View>




      <View style={styles.metaRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{pretty.date}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{pretty.time}</Text>
        </View>
      </View>

  <ScrollView contentContainerStyle={styles.scroll}>
  {isAppointment ? (
    <>
      {/* Beschreibung */}
      <View style={[UI.bordered, styles.card]}>
        <Text style={styles.cardTitle}>Beschreibung</Text>

        {normalized.description?.trim() ? (
          <Text style={styles.cardText}>{normalized.description}</Text>
        ) : null}
      </View>

      {/* Bild */}
      <View style={[UI.bordered, styles.card]}>
        <Text style={styles.cardTitle}>Bild</Text>

        {normalized.imageUri ? (
          <Pressable
            onPress={() => setPreviewUri(normalized.imageUri)}
            style={[UI.bordered, styles.imagePressable]}
          >
            <Image
              source={{ uri: normalized.imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Tippen zum Vergrößern</Text>
            </View>
          </Pressable>
        ) : null}
      </View>

      {/* Sprachmemo */}
      <View style={[UI.bordered, styles.card]}>
        <Text style={styles.cardTitle}>Sprachmemo</Text>

        {normalized.audioUri ? (
          <Pressable onPress={togglePlay} style={[UI.primaryButton, styles.audioBtn]}>
            <Text style={UI.primaryButtonText}>
              {isPlaying ? "Stop" : "Play"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </>
    ) : (
      <View style={[UI.bordered, styles.card]}>
        <Text style={styles.cardTitle}>Info</Text>
      </View>
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
          <Image
            source={{ uri: previewUri || "" }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({

  screen: {
    paddingHorizontal: 20,
  },

  smallHeader: {
    color: COLORS.textMuted,
    marginBottom: 6,
    textDecorationLine: "underline",
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: FONT_WEIGHT.normal,
    letterSpacing: 0.2,
    marginBottom: 12,
    textAlign: "left",
    color: COLORS.text,
  },

  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  pillText: {
    fontSize: 14,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  // scroll content
  scroll: {
    paddingBottom: 40,
  },

  card: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },

  cardTitle: {
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 8,
    color: COLORS.text,
  },

  cardText: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.text,
  },

  imagePressable: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },

  image: { width: "100%", height: 240 },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  imageOverlayText: {
    color: "white",
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: "center",
  },

  emptyBox: {
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.body,
    textAlign: "center",
  },

  audioBtn: {
    marginTop: 6,
    borderRadius: 12,
  },

  muted: { color: COLORS.textMuted, marginTop: 10 },

  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center",
    alignItems: "center",
  },

  previewImage: { width: "95%", height: "95%" },

titleBox: {
  alignSelf: "flex-start",    
  backgroundColor: COLORS.disabled,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.border,
  paddingVertical: 4,
  paddingHorizontal: 12,
  marginBottom: 12,
},

title: {
  color: COLORS.text,            
  fontSize: 18,
  fontWeight: FONT_WEIGHT.normal,
},


});
