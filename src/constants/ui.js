import { COLORS } from "./colors";
import { FONT_SIZE, FONT_WEIGHT } from "./typography";

export const UI = {
  // Containers
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screenPadded: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
  },

  // Text
  heading: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: "center",
    marginBottom: 12,
    color: COLORS.text,
  },

  textMuted: {
    color: COLORS.textMuted,
  },

  // Buttons
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  primaryButtonText: {
    color: COLORS.primaryText,
    fontWeight: FONT_WEIGHT.bold,
  },
  primaryButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  // Borders
  bordered: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
};
