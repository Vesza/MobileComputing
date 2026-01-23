// Platform wird genutzt, um plattformspezifische Werte zu setzen.
// Dadurch können Abstände und UI-Verhalten zwischen iOS und Android angepasst werden.
import { Platform } from "react-native";

// LAYOUT enthält Layout-Konstanten, die in Screens für Padding und UI-Komponenten verwendet werden.
// offsets.top/bottom sind fixe Abstände, die sich an Statusbar/Notch/Bottom-Area orientieren.
// datePickerDisplay steuert, wie der DateTimePicker dargestellt wird (iOS inline, Android default).
export const LAYOUT = {
  offsets: {
    top: Platform.OS === "android" ? 52 : 62,
    bottom: Platform.OS === "android" ? 80 : 40,
  },

  datePickerDisplay: Platform.OS === "ios" ? "inline" : "default",
};
