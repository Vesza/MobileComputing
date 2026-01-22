import React, { useState, useCallback } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONT_SIZE, FONT_WEIGHT, UI } from "../constants";

export default function HeaderLogoutButton() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await logout();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[UI.bordered, styles.btn]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.text}>Logout</Text>
      </Pressable>

      <ConfirmModal
        visible={open}
        title="Logout?"
        subtitle="Willst du dich wirklich abmelden?"
        loading={loading}
        onCancel={() => (loading ? null : setOpen(false))}
        onConfirm={onConfirm}
        confirmText="Ja"
        denyText="Nein"
        cancelText="Abbrechen"
      />
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  text: {
    color: COLORS.text,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },
});
