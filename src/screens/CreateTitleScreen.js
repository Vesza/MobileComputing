import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

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

 
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  // audio memo 
  const [audioUri, setAudioUri] = useState(null);
  const [memoOpen, setMemoOpen] = useState(false);


  const [detailsOpen, setDetailsOpen] = useState(false);

  const canContinue = title.trim().length > 0;

  // playback + recording refs 
  const soundRef = useRef(null);
  const recordingRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);


  // Cleanup on unmount

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

        try {
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            recordingRef.current = null;
          }
        } catch {}
      })();
    };
  }, []);

 
  // Image handling

  const pickFromGallery = useCallback(async () => {
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
  }, []);

  const takePhoto = useCallback(async () => {
    try {
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
    } catch (e) {
      console.log("Camera error:", e);
      Alert.alert("Fehler", String(e?.message || e));
    }
  }, []);

  const chooseImageSource = useCallback(() => {
    Alert.alert("Bild hinzufügen", "Quelle auswählen", [
      { text: "Kamera", onPress: takePhoto },
      { text: "Galerie", onPress: pickFromGallery },
      { text: "Abbrechen", style: "cancel" },
    ]);
  }, [pickFromGallery, takePhoto]);

 
  // Audio memo handling

  const stopPlayback = useCallback(async () => {
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
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Mikrofon benötigt", "Bitte erlaube Zugriff auf das Mikrofon.");
        return;
      }

      await stopPlayback();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      recordingRef.current = rec;
      setIsRecording(true);
    } catch (e) {
      console.log("startRecording error:", e);
      Alert.alert("Fehler", String(e?.message || e));
      setIsRecording(false);
      recordingRef.current = null;
    }
  }, [stopPlayback]);

  const stopRecording = useCallback(async () => {
    try {
      if (!recordingRef.current) return;

      setIsRecording(false);

      const rec = recordingRef.current;
      recordingRef.current = null;

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();

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
      recordingRef.current = null;
    }
  }, []);

  const togglePlay = useCallback(async () => {
    try {
      if (!audioUri) return;

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
      console.log("togglePlay error:", e);
      Alert.alert("Fehler", String(e?.message || e));
    }
  }, [audioUri, isPlaying, stopPlayback]);

  const removeMemo = useCallback(async () => {
    await stopPlayback();
    setAudioUri(null);
  }, [stopPlayback]);


  // description modal helpers

  const openDescription = useCallback(() => {
    setDescDraft(description || "");
    setDescOpen(true);
  }, [description]);

  const saveDescription = useCallback(() => {
    setDescription(descDraft.trim());
    setDescOpen(false);
  }, [descDraft]);


  // details sheet helpers

  const openDetailsSheet = useCallback(() => {
    if (!isAppointment) return;
    setDetailsOpen(true);
  }, [isAppointment]);

  const closeDetailsSheet = useCallback(() => setDetailsOpen(false), []);

  const openDescriptionFromSheet = useCallback(() => {
    setDetailsOpen(false);
    openDescription();
  }, [openDescription]);

  const openImageFromSheet = useCallback(() => {
    setDetailsOpen(false);
    chooseImageSource();
  }, [chooseImageSource]);

  const openMemoFromSheet = useCallback(() => {
    setDetailsOpen(false);
    setMemoOpen(true);
  }, []);


  const goNext = useCallback(() => {
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
  }, [canContinue, navigation, kind, title, isAppointment, imageUri, description, audioUri]);




  const showExtrasSummary = isAppointment && (imageUri || description?.trim() || audioUri);

  return (
    <View
      style={[
        UI.screen,
        styles.container,
        {
          paddingTop: LAYOUT.offsets.top,
          paddingBottom: LAYOUT.offsets.bottom,
        },
      ]}
    >
      <Text style={styles.headline}>{headline}</Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={isAppointment ? "Titel" : isReminder ? "Reminder Text" : "Notification Text"}
        placeholderTextColor={COLORS.textMuted}
        style={[UI.bordered, styles.input]}
      />

      <Pressable
        onPress={canContinue ? goNext : null}
        style={[UI.primaryButton, !canContinue && UI.primaryButtonDisabled]}
      >
        <Text style={[UI.primaryButtonText, !canContinue && UI.primaryButtonTextDisabled]}>
          Weiter
        </Text>
      </Pressable>


      {isAppointment ? (
        <View style={styles.detailsRow}>
          <View style={styles.detailsCenter}>
           {showExtrasSummary ? (
            <View style={[UI.bordered, styles.summaryCard]}>
              {description?.trim() ? <Text style={styles.summaryLine}>✓ Beschreibung</Text> : null}
              {imageUri ? <Text style={styles.summaryLine}>✓ Bild</Text> : null}
              {audioUri ? <Text style={styles.summaryLine}>✓ Sprachmemo</Text> : null}
            </View>
            ) : null}
        </View>

    <Pressable
      onPress={openDetailsSheet}
      style={[UI.bordered, styles.squareBtn]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Text style={styles.squareTextIcon}>＋</Text>
    </Pressable>
  </View>
) : null}


      {/* -------------------- Details Bottom Sheet -------------------- */}
      <Modal
        visible={detailsOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDetailsSheet}
      >
        <Pressable style={styles.sheetBackdrop} onPress={closeDetailsSheet}>
          <Pressable style={[UI.bordered, styles.sheet]} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Details hinzufügen</Text>

            <Pressable style={[UI.bordered, styles.sheetItem]} onPress={openDescriptionFromSheet}>
              <Text style={styles.sheetItemText}>📝 Beschreibung</Text>
            </Pressable>

            <Pressable style={[UI.bordered, styles.sheetItem]} onPress={openImageFromSheet}>
              <Text style={styles.sheetItemText}>🖼️ Bild</Text>
            </Pressable>

            <Pressable style={[UI.bordered, styles.sheetItem]} onPress={openMemoFromSheet}>
              <Text style={styles.sheetItemText}>🎙️ Sprachmemo</Text>
            </Pressable>

            <View style={{ height: 8 }} />

            <Pressable style={[UI.bordered, styles.sheetCancel]} onPress={closeDetailsSheet}>
              <Text style={styles.sheetCancelText}>Abbrechen</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* -------------------- Description Modal -------------------- */}
      <Modal
        visible={descOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDescOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setDescOpen(false)}>
          <Pressable style={[UI.bordered, styles.modalBox]} onPress={() => {}}>
            <Text style={styles.modalTitle}>Beschreibung</Text>

            <TextInput
              value={descDraft}
              onChangeText={setDescDraft}
              placeholder="Beschreibung hinzufügen…"
              placeholderTextColor={COLORS.textMuted}
              style={[UI.bordered, styles.descInput]}
              multiline
            />

            <View style={styles.modalRow}>
              <Pressable style={[UI.bordered, styles.modalBtn]} onPress={() => setDescOpen(false)}>
                <Text style={styles.modalBtnText}>Abbrechen</Text>
              </Pressable>

              <Pressable style={[UI.primaryButton, styles.modalBtn]} onPress={saveDescription}>
                <Text style={UI.primaryButtonText}>Speichern</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>


      <Modal
        visible={memoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMemoOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMemoOpen(false)}>
          <Pressable style={[UI.bordered, styles.modalBox]} onPress={() => {}}>
            <Text style={styles.modalTitle}>Sprachmemo</Text>

            <View style={{ height: 10 }} />

            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              style={[UI.primaryButton, styles.fullBtn]}
            >
              <Text style={UI.primaryButtonText}>
                {isRecording ? "Stop Aufnahme" : "Aufnehmen"}
              </Text>
            </Pressable>

            <View style={{ height: 10 }} />

            <Pressable
              onPress={togglePlay}
              disabled={!audioUri || isRecording}
              style={[
                UI.bordered,
                styles.fullBtn,
                (!audioUri || isRecording) && styles.btnDisabled,
              ]}
            >
              <Text style={styles.modalBtnText}>
                {isPlaying ? "Stop" : "Play"}
              </Text>
            </Pressable>

            <View style={{ height: 10 }} />

            <Pressable
              onPress={removeMemo}
              disabled={!audioUri || isRecording}
              style={[
                UI.bordered,
                styles.fullBtn,
                (!audioUri || isRecording) && styles.btnDisabled,
              ]}
            >
              <Text style={styles.modalBtnText}>Memo entfernen</Text>
            </Pressable>

            <View style={{ height: 12 }} />

            <Pressable style={[UI.bordered, styles.sheetCancel]} onPress={() => setMemoOpen(false)}>
              <Text style={styles.sheetCancelText}>Schließen</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Optional inline image preview under everything*/}
      {isAppointment && imageUri ? (
        <View style={[UI.bordered, styles.previewCard]}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <Pressable onPress={() => setImageUri(null)} style={styles.removePill}>
            <Text style={styles.removePillText}>Entfernen</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },

  headline: {
    textAlign: "center",
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.normal,
    color: COLORS.text,
    marginBottom: 14,
  },

  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

detailsRow: {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 12,
},


detailsCenter: {
  flex: 1,
  alignItems: "center",
},


  squareBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  squareTextIcon: {
    fontSize: 22,
    color: COLORS.text,
  },

  summaryCard: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    minWidth: 160,
    //alignItems: "center",
  },

  summaryLine: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.normal,
    textAlign: "center",
  },

  // Sheet
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },

  sheet: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
  },

  sheetTitle: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },

  sheetItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
  },

  sheetItemText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  sheetCancel: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.disabled,
    alignItems: "center",
  },

  sheetCancelText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modalBox: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    padding: 16,
  },

  modalTitle: {
    textAlign: "center",
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  descInput: {
    marginTop: 12,
    minHeight: 120,
    textAlignVertical: "top",
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    padding: 12,
    borderRadius: 12,
  },

  modalRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",

  },

  modalBtnText: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },

  fullBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.surface,
   
  },

  btnDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.disabled,
  },

  // Image preview
  previewCard: {
    marginTop: 18,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },

  previewImage: {
    width: "100%",
    height: 140,
  },

  removePill: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(250, 248, 248, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  removePillText: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },
});
