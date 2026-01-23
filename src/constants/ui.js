// Importiert zentrale Farben und Typografie-Werte.
// Diese Konstanten werden hier genutzt, um wiederverwendbare Standard-Styles zu definieren.
import { COLORS } from "./colors";
import { FONT_SIZE, FONT_WEIGHT } from "./typography";

// UI bündelt wiederverwendbare Style-Blöcke.
// Damit können Screens und Komponenten einheitlich gestaltet werden, ohne Styles zu duplizieren.
export const UI = {
  // Grundlayout für einen Screen: volle Höhe und Hintergrundfarbe.
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Variante für Screens mit horizontalem Innenabstand.
  screenPadded: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },

  // Zentriert Inhalte vertikal innerhalb des Screens.
  center: {
    flex: 1,
    justifyContent: "center",
  },

  // Standard-Überschrift: mittig, etwas größer und fett.
  heading: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: "center",
    marginBottom: 12,
    color: COLORS.text,
  },

  // Gedämpfter Text, der weniger Aufmerksamkeit bekommt als normaler Text.
  textMuted: {
    color: COLORS.textMuted,
  },

  // Primärer Button-Stil: Hintergrund, Padding, Rundung und Ausrichtung.
  // Zusätzlich wird ein Rahmen gesetzt, damit der Button optisch klar abgegrenzt ist.
  primaryButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,                
    borderColor: COLORS.border,
  },

  // Variante für deaktivierte Buttons.
  primaryButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },

  // Standard-Text im Button: gut lesbar und fett.
  primaryButtonText: {
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Variante für deaktivierten Button-Text.
  primaryButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  // Standard-Rahmenstil, der in vielen Komponenten wiederverwendet wird.
  bordered: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
};
