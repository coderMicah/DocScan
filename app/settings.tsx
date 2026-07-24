import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../src/contexts/SettingsContext";
import { getDocumentCount, getPageCount } from "../src/db/operations";
import { C, FONT, R, S, SIZE, TOUCH } from "../src/lib/theme";
import { formatSize, getStorageSize } from "../src/services/storage";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  iconColor,
  iconBg,
  label,
  sublabel,
  right,
  last,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  right: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={iconColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel && <Text style={styles.rowSublabel}>{sublabel}</Text>}
      </View>
      {right}
    </View>
  );
}

function StatCard({
  icon,
  iconColor,
  iconBg,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  value: string | number;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { maxPages, setMaxPages } = useSettings();
  const insets = useSafeAreaInsets();

  const [docCount, setDocCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [storageStr, setStorageStr] = useState("0 B");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const dc = await getDocumentCount();
    const pc = await getPageCount();
    const bytes = await getStorageSize();
    setDocCount(dc);
    setPageCount(pc);
    setStorageStr(await formatSize(bytes));
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: insets.bottom + S.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statsRow}>
        <StatCard
          icon="document-text"
          iconColor={C.accent}
          iconBg={C.accentSoft}
          value={docCount}
          label="Documents"
        />
        <StatCard
          icon="copy"
          iconColor={C.success}
          iconBg={C.successSoft}
          value={pageCount}
          label="Pages"
        />
        <StatCard
          icon="server"
          iconColor={C.warning}
          iconBg={C.warningSoft}
          value={storageStr}
          label="Storage"
        />
      </View>

      <Section title="Scanner">
        <Row
          icon="layers"
          iconColor={C.accent}
          iconBg={C.accentSoft}
          label="Max pages per scan"
          sublabel="Limit the pages captured in one session"
          last
          right={
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setMaxPages(Math.max(1, maxPages - 1))}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color={C.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{maxPages}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setMaxPages(Math.min(50, maxPages + 1))}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
          }
        />
      </Section>

      <Section title="About">
        <Row
          icon="information-circle"
          iconColor={C.accent}
          iconBg={C.accentSoft}
          label="Version"
          right={
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1.0.0</Text>
            </View>
          }
        />
        <Row
          icon="shield-checkmark"
          iconColor={C.success}
          iconBg={C.successSoft}
          label="Data Privacy"
          sublabel="All data stays on your device"
          last
          right={
            <Ionicons name="checkmark-circle" size={20} color={C.success} />
          }
        />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  statsRow: {
    flexDirection: "row",
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    marginBottom: S.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    paddingVertical: S.md,
    gap: S.xs,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: SIZE.lg,
    fontWeight: FONT.bold,
    color: C.text,
  },
  statLabel: {
    fontSize: SIZE.xs,
    color: C.textMuted,
    fontWeight: FONT.medium,
  },

  section: {
    marginTop: S.lg,
    paddingHorizontal: S.lg,
  },
  sectionTitle: {
    fontSize: SIZE.xs,
    fontWeight: FONT.semibold,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: S.sm,
    marginLeft: S.xs,
  },
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: S.md,
    paddingVertical: S.md,
    gap: S.md,
    minHeight: TOUCH,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1 },
  rowLabel: {
    fontSize: SIZE.md,
    fontWeight: FONT.medium,
    color: C.text,
  },
  rowSublabel: {
    fontSize: SIZE.xs,
    color: C.textMuted,
    marginTop: 2,
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  stepperBtn: {
    width: TOUCH - S.sm,
    height: TOUCH - S.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontSize: SIZE.md,
    fontWeight: FONT.bold,
    color: C.text,
    minWidth: 28,
    textAlign: "center",
  },

  badge: {
    backgroundColor: C.accentSoft,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.accentBorder,
    paddingHorizontal: S.sm + S.xs,
    paddingVertical: S.xs,
  },
  badgeText: {
    fontSize: SIZE.sm,
    fontWeight: FONT.semibold,
    color: C.accent,
  },
});
