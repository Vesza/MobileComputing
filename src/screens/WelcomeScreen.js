import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "../services/FirebaseConfig";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

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

export default function WelcomeScreen({ navigation, route }) {
  const { user } = useAuth();

  const [todayDate, setTodayDate] = useState(() => new Date());
  const todayLabel = useMemo(() => formatTodayHeader(todayDate), [todayDate]);

  const [todayItems, setTodayItems] = useState([]);

  const [notifications, setNotifications] = useState([]);

  // Toast state
  const lastToastRef = useRef(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const msg = route?.params?.toast;
    if (!msg) return;

    if (lastToastRef.current === msg) return;
    lastToastRef.current = msg;

    setToastMsg(String(msg));
    setToastVisible(true);

    const t = setTimeout(() => {
      setToastVisible(false);
      setToastMsg("");
    }, 1500);

    return () => clearTimeout(t);
  }, [route?.params?.toast]);

  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      setTodayDate((prev) => (prev.toDateString() !== now.toDateString() ? now : prev));
    }, 30 * 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setTodayItems([]);
      return;
    }

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
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title ?? "(ohne Titel)",
              startsAt: data.startsAt?.toDate ? data.startsAt.toDate() : null,
              description: typeof data.description === "string" ? data.description : null,
              imageUri: typeof data.imageUri === "string" ? data.imageUri : null,
              audioUri: typeof data.audioUri === "string" ? data.audioUri : null,
            };
          })
          .filter((x) => x.startsAt);

        setTodayItems(list);
      },
      (err) => console.log("Today appointments snapshot error:", err)
    );

    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("fireAt", "asc"),
      limit(5)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text ?? "",
            fireAt: data.fireAt?.toDate ? data.fireAt.toDate() : null,
          };
        });
        setNotifications(list);
      },
      (err) => console.log("Welcome notifications snapshot error:", err)
    );

    return unsub;
  }, [user?.uid]);

  const openDetail = (it) => {
    navigation.navigate("Detail", {
      type: "appointment",
      item: {
        id: it.id,
        title: it.title,
        startsAt: it.startsAt ? it.startsAt.toISOString() : null,
        description: it.description ?? null,
        imageUri: it.imageUri ?? null,
        audioUri: it.audioUri ?? null,
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: LAYOUT.offsets.top,
          paddingBottom: LAYOUT.offsets.bottom,
        },
      ]}
    >
      <View style={styles.quoteBlock}>
        <Text style={styles.quoteText} allowFontScaling={false}>
          Alles hat seine Zeit
        </Text>
      </View>

      <View style={styles.centerBlock}>
        <Text style={styles.dayTitle}>Was ist heute wichtig?</Text>

        {todayItems.length > 0 ? (
          <View style={[UI.bordered, styles.todayCard, styles.todayCardMin]}>
            <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ paddingBottom: 6 }}>
              {todayItems.map((it) => (
                <Pressable
                  key={it.id}
                  onPress={() => openDetail(it)}
                  style={[UI.bordered, styles.todayRow]}
                >
                  <Text style={styles.todayRowTime}>{formatTime(it.startsAt)}</Text>
                  <View style={styles.todayRowDivider} />
                  <Text style={styles.todayRowTitle} numberOfLines={2}>
                    {it.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={[UI.bordered, styles.emptyTodayBox]}>
            <Text style={styles.sectionHeadline}>Termine</Text>
            <Text style={styles.emptyText}>
              Für den heutigen Tag wurde noch kein Termin zugeordnet.
            </Text>
          </View>
        )}


<View style={[UI.bordered, styles.smallCard]}>
  <View style={styles.cardHeaderRow}>
    <Pressable onPress={() => navigation.navigate("Notifications")}>
      <Text style={styles.cardTitle}>Notifications</Text>
    </Pressable>
  </View>

  {notifications.length > 0 ? (
    notifications.map((n) => (
      <View key={n.id} style={[UI.bordered, styles.smallRow]}>
        <Text style={styles.smallRowTitle} numberOfLines={1}>
          {n.text}
        </Text>
      </View>
    ))
  ) : (
    <Text style={styles.cardEmpty}>Keine Notifications vorhanden.</Text>
  )}
</View>

      </View>

      
      <View style={[styles.bottomRow, { bottom: LAYOUT.offsets.bottom + -40}]}>
        <Pressable
          style={[UI.bordered, styles.squareBtn]}
          onPress={() => navigation.navigate("Calendar")}
        >
          <CalendarDateIcon date={todayDate} />
        </Pressable>

        <Pressable
          style={[UI.bordered, styles.squareBtn]}
          onPress={() => navigation.navigate("QuickActions")}
        >
          <Text style={styles.squareTextIcon}>＋</Text>
        </Pressable>
      </View>

      <Toast visible={toastVisible} message={toastMsg} />
      <Pressable
        style={styles.footer}
        onPress={() => navigation.navigate("Impressum")}
      >
        <Text style={styles.footerText}>Impressum</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },

  loggedInText: {
    color: COLORS.textMuted,
    textDecorationLine: "underline",
    marginBottom: 10,
  },

  centerBlock: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 48,
  },

  dayTitle: {
    fontSize: FONT_SIZE.title,
    textAlign: "left",
    marginBottom: 11,
    color: COLORS.text,
    fontFamily: "BuenardReg",
    letterSpacing: -0.1,
  },

  todayCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: COLORS.surface,
  },

  sectionHeadline: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 10,
    textAlign: "center",
    color: COLORS.text,
  },

  todayRow: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  todayRowTime: { width: 42, color: COLORS.textMuted, fontWeight: FONT_WEIGHT.bold },

  todayRowDivider: { width: 1, height: 20, backgroundColor: COLORS.border, marginHorizontal: 10 },

  todayRowTitle: { flex: 1, fontSize: 15, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },

  todayHint: {
    marginTop: 8,
    color: COLORS.textMuted,
    textDecorationLine: "underline",
    textAlign: "center",
  },

  emptyTodayBox: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: COLORS.surface,
  },

  emptyText: { color: COLORS.textMuted, textAlign: "center" },

bottomRow: {
  position: "absolute",
  left: 16,
  right: 16,
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 8,
},


  squareBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  squareTextIcon: { fontSize: 22 },

  calIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  calTopBar: { position: "absolute", top: 0, left: 0, right: 0, height: 7, backgroundColor: COLORS.primary },

  calDay: { marginTop: 4, fontSize: 14, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },

  bottomLeftPressable: {
    position: "absolute",
    left: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },

  todayCardMin: {
    minHeight: 260,
  },

  quoteBlock: {
    width: "100%",
    alignSelf: "stretch",
    //marginTop: 4,
    marginBottom: 36,
    //paddingHorizontal: 32,
  },

  quoteText: {
    textAlign: "center",
    fontSize: 54,
    lineHeight: 60,
    fontWeight: FONT_WEIGHT.normal,
    color: COLORS.text,
    fontFamily: "Awesome",
    letterSpacing: 0.3,
    includeFontPadding: true,
  },

  smallCard: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    backgroundColor: COLORS.surface,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  cardTitle: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textDecorationLine: "underline",
  },

  cardEmpty: {
    color: COLORS.textMuted,
    textAlign: "center",
    paddingVertical: 10,
  },

  smallRow: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },

  smallRowTitle: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },

  footer: {
  width: "100%",
  alignItems: "center",
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
},

footerText: {
  fontSize: 12,
  color: COLORS.textMuted,
  textDecorationLine: "underline",
},

});
