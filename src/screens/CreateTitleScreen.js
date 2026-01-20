import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  Modal,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { saveImageToLocalAppStorageAsync } from "../services/localImages";
import { saveAudioToLocalAppStorageAsync } from "../services/localAudio";
import BottomLinks from "../components/BottomLinks";

export default function CreateTitleScreen({ navigation, route }) {
  const kind = route?.params?.kind ?? "appointment";

  const isAppointment = kind === "appointment";
  const isNotification = kind === "notification";
  const isReminder = kind === "reminder";

  const headline = useMemo(() => {
    if (isAppointment) return "Titel eingeben";
    if (isReminder) return "Reminder Text";
    return "Notification Text";
  }, [isAppointment, isReminder]);

  const [title, setTitle] = useState("");

  // appointment-only extras
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  // NEW: audio memo (appointment-only)
  const [audioUri, setAudioUri] = useState(null);
  const [memoOpen, setMemoOpen] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const canContinue = title.trim().length > 0;

  useEffect(() => {
    return () => {
      // cleanup sound + recording on unmount
      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch {}
        try {
          if (recording) {
            await recording.stopAndUnloadAsync();
          }
        } catch {}
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------
  // Image handling
  // --------------------
  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Zugriff auf Fotos benötigt",
          "Bitte erlaube Zugriff auf deine Galerie in den Einstellungen.",
          [
            { text: "Abbrechen", style: "cancel" },
            { text: "Einstellungen öffnen", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert("Fehler", "Kein Bild gefunden.");
        return;
      }

      const saved = await saveImageToLocalAppStorageAsync(uri);
      setImageUri(saved);
    } catch (e) {
      console.log("Gallery picker error:", e);
      Alert.alert("Fehler", String(e?.message || e));
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Kamera benötigt", "Bitte erlaube Zugriff auf die Kamera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    const saved = await saveImageToLocalAppStorageAsync(uri);
    setImageUri(saved);
  };

  const chooseImageSource = () => {
    Alert.alert("Bild hinzufügen", "Quelle auswählen", [
      { text: "Kamera", onPress: takePhoto },
      { text: "Galerie", onPress: pickFromGallery },
      { text: "Abbrechen", style: "cancel" },
    ]);
  };

  // --------------------
  // NEW: Audio memo handling
  // --------------------
  const openMemo = () => setMemoOpen(true);

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Mikrofon benötigt", "Bitte erlaube Zugriff auf das Mikrofon.");
        return;
      }

      // stop playback if any
      await stopPlayback();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      console.log("startRecording error:", e);
      Alert.alert("Fehler", String(e?.message || e));
      setIsRecording(false);
      setRecording(null);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      if (!uri) {
        Alert.alert("Fehler", "Aufnahme-Datei nicht gefunden.");
        return;
      }

      const saved = await saveAudioToLocalAppStorageAsync(uri);
      setAudioUri(saved);
    } catch (e) {
      console.log("stopRecording error:", e);
      Alert.alert("Fehler", String(e?.message || e));
      setIsRecording(false);
      setRecording(null);
    }
  };

  const playMemo = async () => {
    try {
      if (!audioUri) return;

      // if already playing -> stop
      if (isPlaying) {
        await stopPlayback();
        return;
      }

      await stopPlayback();

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st || !st.isLoaded) return;
        if (st.didJustFinish) {
          stopPlayback();
        }
      });
    } catch (e) {
      console.log("playMemo error:", e);
      Alert.alert("Fehler", String(e?.message || e));
    }
  };

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

  const removeMemo = async () => {
    await stopPlayback();
    setAudioUri(null);
  };

  // --------------------
  // Continue
  // --------------------
  const goNext = () => {
    if (!canContinue) return;

    navigation.navigate("CreateDate", {
      draft: {
        kind,
        title: title.trim(),
        date: null,
        time: null,
        durationSec: null,

        // appointment-only:
        imageUri: isAppointment ? imageUri ?? null : null,
        description: isAppointment ? (description?.trim() || null) : null,
        audioUri: isAppointment ? audioUri ?? null : null,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.heading}>{headline}</Text>

        <TextInput
          placeholder={isAppointment ? "Titel" : "Text"}
          value={title}
          onChangeText={setTitle}
          style={[styles.input, isNotification && styles.inputMulti]}
          multiline={isNotification}
          textAlignVertical={isNotification ? "top" : "auto"}
        />

        {isAppointment && imageUri ? (
          <>
            <View style={{ height: 12 }} />
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <View style={{ height: 8 }} />
            <Pressable onPress={() => setImageUri(null)}>
              <Text style={styles.removeLink}>Bild entfernen</Text>
            </Pressable>
          </>
        ) : null}

        {isAppointment && audioUri ? (
          <>
            <View style={{ height: 14 }} />
            <View style={styles.audioRow}>
              <Pressable onPress={playMemo} style={styles.audioBtn}>
                <Text style={styles.audioBtnText}>{isPlaying ? "Stop" : "Play"}</Text>
              </Pressable>
              <Text style={styles.audioHint} numberOfLines={1}>
                Sprachmemo hinzugefügt
              </Text>
              <Pressable onPress={removeMemo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.removeLink}>Entfernen</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        <View style={{ height: 14 }} />

        <Pressable
          onPress={canContinue ? goNext : null}
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
        >
          <Text style={[styles.nextBtnText, !canContinue && styles.nextBtnTextDisabled]}>
            Weiter
          </Text>
        </Pressable>
      </View>

      {/* Appointment-only FABs (JETZT 3 STÜCK) */}
      {isAppointment ? (
        <View style={styles.fabContainer}>
          {/* Bild */}
          <Pressable style={styles.fabButton} onPress={chooseImageSource}>
            <Text style={styles.fabIcon}>🖼️</Text>
          </Pressable>

          {/* Beschreibung */}
          <Pressable
            style={styles.fabButton}
            onPress={() => {
              setDescDraft(description);
              setDescOpen(true);
            }}
          >
            <Text style={styles.fabIcon}>📝</Text>
          </Pressable>

          {/* NEW: Memo */}
          <Pressable style={styles.fabButton} onPress={openMemo}>
            <Text style={styles.fabIcon}>🎙️</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Description modal (appointment-only) */}
      <Modal
        visible={descOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDescOpen(false)}
      >
        <View style={styles.descBackdrop}>
          <View style={styles.descSheet}>
            <Text style={styles.descTitle}>Notizen</Text>

            <TextInput
              value={descDraft}
              onChangeText={setDescDraft}
              placeholder="Schreibe hier deine Beschreibung..."
              multiline
              textAlignVertical="top"
              style={styles.descInput}
            />

            <View style={styles.descButtonsRow}>
              <Pressable
                style={[styles.descBtn, styles.descBtnSecondary]}
                onPress={() => setDescOpen(false)}
              >
                <Text style={styles.descBtnTextDark}>Abbrechen</Text>
              </Pressable>

              <Pressable
                style={[styles.descBtn, styles.descBtnPrimary]}
                onPress={() => {
                  setDescription(descDraft.trim());
                  setDescOpen(false);
                }}
              >
                <Text style={styles.descBtnTextWhite}>Speichern</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW: Memo modal */}
      <Modal
        visible={memoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isRecording) setMemoOpen(false);
        }}
      >
        <View style={styles.descBackdrop}>
          <View style={styles.descSheet}>
            <Text style={styles.descTitle}>Sprachmemo</Text>

            <Text style={styles.memoStatus}>
              {isRecording ? "Aufnahme läuft…" : audioUri ? "Memo bereit" : "Noch keine Memo"}
            </Text>

            <View style={{ height: 14 }} />

            <View style={styles.memoButtonsRow}>
              {!isRecording ? (
                <Pressable style={[styles.descBtn, styles.descBtnPrimary]} onPress={startRecording}>
                  <Text style={styles.descBtnTextWhite}>Aufnehmen</Text>
                </Pressable>
              ) : (
                <Pressable style={[styles.descBtn, styles.descBtnPrimary]} onPress={stopRecording}>
                  <Text style={styles.descBtnTextWhite}>Stop</Text>
                </Pressable>
              )}

              <Pressable
                style={[styles.descBtn, styles.descBtnSecondary]}
                onPress={audioUri ? playMemo : null}
              >
                <Text style={styles.descBtnTextDark}>{isPlaying ? "Stop" : "Play"}</Text>
              </Pressable>
            </View>

            <View style={{ height: 10 }} />

            <View style={styles.memoButtonsRow}>
              <Pressable
                style={[styles.descBtn, styles.descBtnSecondary]}
                onPress={audioUri ? removeMemo : null}
              >
                <Text style={styles.descBtnTextDark}>Entfernen</Text>
              </Pressable>

              <Pressable
                style={[styles.descBtn, styles.descBtnSecondary]}
                onPress={() => {
                  if (!isRecording) setMemoOpen(false);
                }}
              >
                <Text style={styles.descBtnTextDark}>Schließen</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BottomLinks
        onLeftPress={() => navigation.goBack()}
        onRightPress={() => navigation.navigate("Welcome")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center" },

  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  inputMulti: { height: 180 },

  preview: { width: 180, height: 180, borderRadius: 12, alignSelf: "center" },
  removeLink: { color: "grey", textDecorationLine: "underline", textAlign: "center" },

  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  audioBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  audioBtnText: { color: "white", fontWeight: "800" },
  audioHint: { flex: 1, color: "#333", fontWeight: "700" },

  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 150,
    flexDirection: "row",
    gap: 12,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  fabIcon: { fontSize: 24 },

  descBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  descSheet: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  descTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  descInput: {
    height: 260,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  descButtonsRow: { flexDirection: "row", gap: 10, marginTop: 12 },

  descBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", borderWidth: 1 },
  descBtnPrimary: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  descBtnSecondary: { backgroundColor: "#f2f2f2", borderColor: "#ddd" },
  descBtnTextWhite: { color: "white", fontWeight: "bold" },
  descBtnTextDark: { color: "#333", fontWeight: "bold" },

  memoStatus: { textAlign: "center", color: "grey", fontWeight: "700" },
  memoButtonsRow: { flexDirection: "row", gap: 10 },

  nextBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextBtnDisabled: { backgroundColor: "#ccc" },
  nextBtnText: { color: "white", fontWeight: "bold" },
  nextBtnTextDisabled: { color: "#888" },
});
