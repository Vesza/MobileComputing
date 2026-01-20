import { Platform } from "react-native";

export const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;
export const TOP_OFFSET = Platform.OS === "android" ? 52 : 62;
