import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/FirebaseConfig";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

function startOfTodayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfTodayDate() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
function formatTodayHeader(d) {
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
function formatTime(d) {
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function CalendarDateIcon({ date }) {
  const day = String(date.getDate());
  return (
    <View style={styles.calIcon}>
      <View style={styles.calTopBar} />
      <Text style={styles.calDay}>{day}</Text>
    </View>
  );
}

export default function WelcomeScreen({ navigation }) {
  const userEmail = auth.currentUser?.email ?? "";

  const [todayDate, setTodayDate] = useState(() => new Date());
  const todayLabel = useMemo(() => formatTodayHeader(todayDate), [todayDate]);

  const [todayItems, setTodayItems] = useState([]);

  // Update date display at midnight (without restarting app)
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      setTodayDate((prev) => (prev.toDateString() !== now.toDateString() ? now : prev));
    }, 30 * 1000);
    return () => clearInterval(tick);
  }, []);

  // Subscribe to today's appointments (ALL)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const from = Timestamp.fromDate(startOfTodayDate());
    const to = Timestamp.fromDate(endOfTodayDate());

    const q = query(
      collection(db, "users", user.uid, "appointments"),
      where("startsAt", ">=", from),
      where("startsAt", "<=", to),
      orderBy("startsAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title ?? "(ohne Titel)",
              startsAt: data.startsAt?.toDate ? data.startsAt.toDate() : null,
              description: typeof data.description === "string" ? data.description : null,
              imageUri: typeof data.imageUri === "string" ? data.imageUri : null,
            };
          })
          .filter((x) => x.startsAt);

        setTodayItems(list);
      },
      (err) => console.log("Today appointments snapshot error:", err)
    );

    return unsub;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log("Logout-Fehler:", e);
    }
  };

  const openDetail = (it) => {
    navigation.navigate("AppointmentDetail", {
      item: {
        id: it.id,
        title: it.title,
        startsAt: it.startsAt ? it.startsAt.toISOString() : null,
        description: it.description ?? null,
        imageUri: it.imageUri ?? null,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Settings */}
      <Pressable style={styles.settingsBtn} onPress={() => navigation.navigate("Settings")}>
        <Text style={styles.topIcon}>⚙️</Text>
      </Pressable>

      <Text style={styles.loggedInText}>Eingeloggt mit: {userEmail || "-"}</Text>

      {/* Center content */}
      <View style={styles.centerBlock}>
        <Text style={styles.dayTitle}>{todayLabel}</Text>

        {todayItems.length > 0 ? (
          <View style={styles.todayCard}>
            <Text style={styles.sectionHeadline}>Heutige Termine</Text>

            <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ paddingBottom: 6 }}>
              {todayItems.map((it) => (
                <Pressable key={it.id} onPress={() => openDetail(it)} style={styles.todayRow}>
                  <Text style={styles.todayRowTime}>{formatTime(it.startsAt)}</Text>
                  <View style={styles.todayRowDivider} />
                  <Text style={styles.todayRowTitle} numberOfLines={2}>
                    {it.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.todayHint}>Tippen auf Termin für Details</Text>
          </View>
        ) : (
          <View style={styles.emptyTodayBox}>
            <Text style={styles.sectionHeadline}>Termine</Text>
            <Text style={styles.emptyText}>
              Für den heutigen Tag wurde noch kein Termin zugeordnet.
            </Text>
          </View>
        )}
      </View>

      {/* 4 Buttons on one height */}
      <View style={styles.bottomRow}>
        <Pressable style={styles.squareBtn} onPress={() => navigation.navigate("Calendar")}>
          <CalendarDateIcon date={todayDate} />
        </Pressable>

        <Pressable style={styles.squareBtn} onPress={() => navigation.navigate("Reminders")}>
          <Text style={styles.squareTextIcon}>⏰</Text>
        </Pressable>

        <Pressable style={styles.squareBtn} onPress={() => navigation.navigate("Notifications")}>
          <Text style={styles.squareTextIcon}>❗</Text>
        </Pressable>

        <Pressable style={styles.squareBtn} onPress={() => navigation.navigate("QuickActions")}>
          <Text style={styles.squareTextIcon}>＋</Text>
        </Pressable>
      </View>

      <Pressable onPress={handleLogout} style={styles.bottomLeftPressable}>
        <Text style={styles.bottomLinkText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  settingsBtn: {
    position: "absolute",
    right: 16,
    top: 44,
    padding: 10,
    zIndex: 10,
  },
  topIcon: { fontSize: 22 },

  loggedInText: {
    position: "absolute",
    left: 20,
    top: 50,
    color: "grey",
    textDecorationLine: "underline",
  },

  centerBlock: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  dayTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },

  todayCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fafafa",
  },

  sectionHeadline: { fontSize: 18, fontWeight: "800", marginBottom: 10, textAlign: "center" },

  todayRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e3e3e3",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "white",
  },
  todayRowTime: { width: 56, color: "grey", fontWeight: "800" },
  todayRowDivider: { width: 1, height: 22, backgroundColor: "#ddd", marginHorizontal: 10 },
  todayRowTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#222" },

  todayHint: { marginTop: 8, color: "grey", textDecorationLine: "underline", textAlign: "center" },

  emptyTodayBox: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "white",
  },
  emptyText: { color: "grey", textAlign: "center" },

  bottomRow: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: BOTTOM_OFFSET + 90,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  squareBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  squareTextIcon: { fontSize: 22 },

  // calendar icon with day number
  calIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  calTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 7,
    backgroundColor: "#007AFF",
  },
  calDay: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "900",
    color: "#333",
  },

  bottomLeftPressable: {
    position: "absolute",
    left: 10,
    bottom: BOTTOM_OFFSET,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },

  bottomLinkText: {
    color: "grey",
    textDecorationLine: "underline",
  },
});
