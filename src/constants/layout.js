import { Platform } from "react-native";

export const LAYOUT = {
  offsets: {
    top: Platform.OS === "android" ? 52 : 62,
    bottom: Platform.OS === "android" ? 80 : 40,
  },

  datePickerDisplay: Platform.OS === "ios" ? "inline" : "default",
};
