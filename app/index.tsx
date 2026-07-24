import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDocuments } from "../src/contexts/DocumentsContext";
import { getPageCount } from "../src/db/operations";
import type { Document } from "../src/db/schema";
import { C, FONT, R, S, SIZE, TOUCH } from "../src/lib/theme";

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
      <View style={[styles.statIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DocumentCard({ doc }: { doc: Document }) {
  const router = useRouter();
  const date = new Date(doc.created_at);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/document/${doc.id}`)}
    >
      <View style={styles.cardIconBox}>
        <Ionicons name="document-text" size={22} color={C.accent} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {doc.name}
        </Text>
        <Text style={styles.cardDate}>{formatted}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.border} />
    </TouchableOpacity>
  );
}

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="scan-outline" size={40} color={C.accent} />
      </View>
      <Text style={styles.emptyTitle}>No scans yet</Text>
      <Text style={styles.emptySub}>
        Your scanned documents will appear here
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={onScan}
        activeOpacity={0.8}
      >
        <Ionicons name="camera" size={18} color="#FFFFFF" />
        <Text style={styles.emptyBtnText}>Scan a Document</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { documents, loading } = useDocuments();
  const insets = useSafeAreaInsets();
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getPageCount().then(setTotalPages);
  }, [documents.length]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>DocScan</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push("/settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      {!loading && documents.length > 0 && (
        <View style={styles.statsRow}>
          <StatCard
            icon="document-text"
            iconColor={C.accent}
            iconBg={C.accentSoft}
            value={documents.length}
            label="Documents"
          />
          <StatCard
            icon="copy"
            iconColor={C.success}
            iconBg={C.successSoft}
            value={totalPages}
            label="Pages"
          />
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={C.accent} />
          <Text style={styles.loadingText}>Loading</Text>
        </View>
      ) : documents.length === 0 ? (
        <EmptyState onScan={() => router.push("/scan")} />
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>All Documents</Text>
          </View>
          <FlatList
            data={documents}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <DocumentCard doc={item} />}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + S.xxl + TOUCH },
            ]}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {!loading && documents.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + S.lg }]}
          onPress={() => router.push("/scan")}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
    paddingBottom: S.md,
  },
  headerTitle: {
    fontSize: SIZE.xxl,
    fontWeight: FONT.bold,
    color: C.text,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: R.md,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  statsRow: {
    flexDirection: "row",
    gap: S.sm,
    paddingHorizontal: S.lg,
    marginBottom: S.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    paddingVertical: S.md,
    gap: S.xs,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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

  listHeader: {
    paddingHorizontal: S.lg,
    marginBottom: S.sm,
  },
  listTitle: {
    fontSize: SIZE.sm,
    fontWeight: FONT.semibold,
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  listContent: { paddingHorizontal: S.lg },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: S.sm,
    padding: S.md,
    minHeight: TOUCH,
  },
  cardIconBox: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: R.md,
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: S.md,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: SIZE.md,
    fontWeight: FONT.semibold,
    color: C.text,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: SIZE.sm - 1,
    color: C.textMuted,
    fontWeight: FONT.regular,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: S.md,
  },
  loadingText: { fontSize: SIZE.md, color: C.textMuted },

  fab: {
    position: "absolute",
    right: S.lg,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: S.xxl + S.lg,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.accentSoft,
    borderWidth: 1.5,
    borderColor: C.accentBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: S.lg,
  },
  emptyTitle: {
    fontSize: SIZE.xl,
    fontWeight: FONT.bold,
    color: C.text,
    marginBottom: S.sm,
    textAlign: "center",
  },
  emptySub: {
    fontSize: SIZE.md,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: S.xxl,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.accent,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderRadius: R.md,
    gap: S.sm,
    minHeight: TOUCH,
  },
  emptyBtnText: {
    fontSize: SIZE.md,
    fontWeight: FONT.semibold,
    color: "#FFFFFF",
  },
});