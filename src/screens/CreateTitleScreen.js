import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  Button,
  Alert,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { saveImageToLocalAppStorageAsync } from "../services/localImages";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

export default function CreateTitleScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  const canContinue = title.trim().length > 0;

const pickFromGallery = async () => {
  try {
    // Request permission (Android may already allow picker, but this avoids surprises)
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

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

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

  const removeImage = () => setImageUri(null);

  const goNext = () => {
    if (!canContinue) return;

    //Creates draft to carry Information to next screen
    navigation.navigate("CreateDate", {
      draft: {
        title: title.trim(),
        date: null,
        time: null,
        imageUri: imageUri ?? null,
        description: description ?? null,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.heading}>Titel eingeben</Text>

        <TextInput
          placeholder="Titel"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />


        {imageUri ? (
          <>
            <View style={{ height: 12 }} />
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <View style={{ height: 8 }} />
            <Pressable onPress={removeImage}>
              <Text style={styles.removeLink}>Bild entfernen</Text>
            </Pressable>
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
        
        <View style={styles.fabContainer}>
        {/* Add image */}

        <Pressable style={styles.fabButton} onPress={chooseImageSource}>
          <Text style={styles.fabIcon}>🖼️</Text>
        </Pressable>

        {/* Add description */}
        <Pressable
         style={styles.fabButton}
         onPress={() => {
          setDescDraft(description); // preload existing text
          setDescOpen(true);         // open notepad modal
         }}
        >
         <Text style={styles.fabIcon}>📝</Text>
        </Pressable>
         </View>
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



      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.bottomPressable, styles.left]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Zurück</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Welcome")}
        style={[styles.bottomPressable, styles.right]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Welcome</Text>
      </Pressable>
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
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },

  preview: { width: 180, height: 180, borderRadius: 12, alignSelf: "center" },

  removeLink: { color: "grey", textDecorationLine: "underline", textAlign: "center" },


  fabContainer: {
    position: "absolute",
   right: 20,
   bottom: BOTTOM_OFFSET + 70, // above Zurück / Weiter
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

  fabIcon: {
    fontSize: 24,
  },

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
descTitle: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 10,
  textAlign: "center",
},
descInput: {
  height: 260,
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 12,
  padding: 12,
  fontSize: 16,
  backgroundColor: "#fafafa",
},
descButtonsRow: {
  flexDirection: "row",
  gap: 10,
  marginTop: 12,
},
descBtn: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  borderWidth: 1,
},
descBtnPrimary: {
  backgroundColor: "#007AFF",
  borderColor: "#007AFF",
},
descBtnSecondary: {
  backgroundColor: "#f2f2f2",
  borderColor: "#ddd",
},
descBtnTextWhite: {
  color: "white",
  fontWeight: "bold",
},
descBtnTextDark: {
  color: "#333",
  fontWeight: "bold",
},



  nextBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextBtnDisabled: { backgroundColor: "#ccc" },
  nextBtnText: { color: "white", fontWeight: "bold" },
  nextBtnTextDisabled: { color: "#888" },

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
});

