// React + Hooks für Lifecycle, Memoisierung und Ref-Handling.
// useLayoutEffect wird genutzt, um Navigation-Optionen direkt vor dem Render zu setzen.
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

// expo-av wird hier nur für die Audio-Wiedergabe genutzt.
import { Audio } from "expo-av";

// Gemeinsame Styles und Design-Konstanten.
import { UI, LAYOUT, COLORS, FONT_WEIGHT, FONT_SIZE } from "../constants";

// Hilfsfunktion, um verschiedene Datumsformate robust in ein Date-Objekt umzuwandeln.
// Unterstützt Firestore Timestamps, Date-Objekte und ISO-Strings.
function parseDateAny(x) {
  if (!x) return null;

  // Firestore timestamp
  if (typeof x === "object" && typeof x.toDate === "function") {
    const d = x.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }

  // Normales Date-Objekt
  if (x instanceof Date) {
    return !Number.isNaN(x.getTime()) ? x : null;
  }

  // ISO-String oder ähnlicher Datumsstring
  if (typeof x === "string") {
    const d = new Date(x);
    return !Number.isNaN(d.getTime()) ? d : null;
  }

  return null;
}

// Formatiert ein Date in kurze Datum- und Zeit-Strings für die Anzeige.
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

// Sorgt dafür, dass Titeltexte nicht leer oder nur Whitespace sind.
// Wenn nichts Sinnvolles da ist, wird ein Fallback angezeigt.
function safeText(x, fallback = "-") {
  const t = typeof x === "string" ? x.trim() : "";
  return t.length ? t : fallback;
}

export default function DetailScreen({ navigation, route }) {
  // type bestimmt, welche Daten erwartet werden und wie gerendert wird.
  // item enthält die eigentlichen Daten, die per Navigation übergeben wurden.
  const type = route?.params?.type; // appointment, reminder, notification
  const item = route?.params?.item;

  // previewUri wird gesetzt, wenn ein Bild angetippt wird, um es im Modal groß zu zeigen.
  const [previewUri, setPreviewUri] = useState(null);

  // Audio-Wiedergabe: Sound-Instanz liegt in einem Ref, Status im State.
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Der Screen hat seine eigene Darstellung, daher wird der Stack-Header deaktiviert.
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Cleanup: Beim Verlassen wird eine laufende Wiedergabe gestoppt und entladen.
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

  // Normalisiert die verschiedenen Typen in eine gemeinsame Struktur.
  // So kann das UI später einfacher arbeiten, ohne überall Sonderfälle zu bauen.
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

  // Aus dem normalisierten Datum werden Anzeige-Strings gebaut.
  // Falls kein Datum vorhanden ist, werden Platzhalter angezeigt.
  const pretty = useMemo(() => {
    if (!normalized?.datetime) return { date: "-", time: "-" };
    return formatDateParts(normalized.datetime);
  }, [normalized]);

  // Header-Label, damit der Screen klar macht, welche Art von Detail gezeigt wird.
  const headerLabel =
    normalized?.type === "appointment"
      ? "Termin"
      : normalized?.type === "reminder"
      ? "Reminder"
      : normalized?.type === "notification"
      ? "Notification"
      : "Detail";

  // Stoppt die Audio-Wiedergabe und gibt Ressourcen frei.
  // Das wird sowohl im Toggle als auch im Cleanup genutzt.
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

  // Startet oder stoppt die Wiedergabe.
  // Vor dem Abspielen wird ein sauberer Zustand hergestellt, damit kein alter Sound hängen bleibt.
  // Ein Playback-Listener stoppt automatisch, wenn die Datei fertig abgespielt ist.
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

  // Wenn kein Element korrekt übergeben wurde, wird eine einfache Fehlansicht gezeigt.
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

  // Für Termine wird ein kompletter Detailbereich gerendert.
  // Für andere Typen wird aktuell nur eine Info-Card angezeigt.
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
            <View style={[UI.bordered, styles.card]}>
              <Text style={styles.cardTitle}>Beschreibung</Text>

              {normalized.description?.trim() ? (
                <Text style={styles.cardText}>{normalized.description}</Text>
              ) : null}
            </View>

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

// Styles für Screen-Layout, Karten, Meta-Pills, Bild-Preview und Titelbox.
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
