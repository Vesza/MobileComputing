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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { saveImageToLocalAppStorageAsync } from "../services/localImages";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

export default function CreateTitleScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const canContinue = title.trim().length > 0;

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Zugriff benötigt", "Bitte erlaube Zugriff auf Fotos/Galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    const saved = await saveImageToLocalAppStorageAsync(uri);
    setImageUri(saved);
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

    navigation.navigate("CreateDate", {
      draft: {
        title: title.trim(),
        date: "",
        time: "",
        imageUri: imageUri ?? null,
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

        <View style={{ height: 8 }} />
        <Button
          title={imageUri ? "Bild ändern" : "Optional: Bild hinzufügen"}
          onPress={chooseImageSource}
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

