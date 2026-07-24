import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getDocument,
  renameDocument,
} from "../../src/db/operations";
import { useDocuments } from "../../src/contexts/DocumentsContext";
import { C, FONT, R, S, SIZE, TOUCH } from "../../src/lib/theme";
import { exportToPdf, exportPageAsImage } from "../../src/services/pdf";
import { deleteFile } from "../../src/services/storage";
import type { DocumentWithPages } from "../../src/db/schema";

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { removeDocument } = useDocuments();
  const insets = useSafeAreaInsets();
  const [doc, setDoc] = useState<DocumentWithPages | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadDocument() {
    if (!id) return;
    const d = await getDocument(Number(id));
    setDoc(d);
    setName(d?.name ?? "");
    setLoading(false);
  }

  const handleRename = useCallback(async () => {
    if (!doc || !name.trim()) return;
    await renameDocument(doc.id, name.trim());
    setDoc({ ...doc, name: name.trim() });
    setEditing(false);
  }, [doc, name]);

  const handleDelete = useCallback(() => {
    if (!doc) return;
    Alert.alert("Delete Document", `Delete "${doc.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          for (const page of doc.pages) {
            await deleteFile(page.image_uri);
          }
          await removeDocument(doc.id);
          router.back();
        },
      },
    ]);
  }, [doc, removeDocument, router]);

  const handleExportPdf = useCallback(async () => {
    if (!doc) return;
    try {
      await exportToPdf(doc.name, doc.pages);
    } catch (error: any) {
      Alert.alert("Export failed", error?.message ?? "Unknown error");
    }
  }, [doc]);

  const handleExportImage = useCallback(
    async (page: DocumentWithPages["pages"][0]) => {
      try {
        const fileName = `${doc?.name ?? "scan"}_page${page.page_number}.jpg`;
        await exportPageAsImage(page.image_uri, fileName);
      } catch (error: any) {
        Alert.alert("Export failed", error?.message ?? "Unknown error");
      }
    },
    [doc]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>Loading document</Text>
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={styles.centered}>
        <Ionicons name="document-outline" size={40} color={C.textMuted} />
        <Text style={styles.notFoundText}>Document not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + S.xxl + TOUCH + S.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nameRow}>
          {editing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoFocus
                onSubmitEditing={handleRename}
                placeholderTextColor={C.textMuted}
                selectionColor={C.accent}
              />
              <TouchableOpacity
                onPress={handleRename}
                style={styles.confirmBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.nameTouchable}
              onPress={() => setEditing(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.docName} numberOfLines={2}>
                {doc.name}
              </Text>
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color={C.accent} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metaBar}>
          <View style={styles.metaItem}>
            <Ionicons name="copy-outline" size={13} color={C.textMuted} />
            <Text style={styles.metaText}>{doc.pages.length} pages</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={C.textMuted} />
            <Text style={styles.metaText}>
              {new Date(doc.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {doc.pages.map((page) => (
          <View key={page.id} style={styles.pageCard}>
            <View style={styles.pageHeader}>
              <View style={styles.pageNumPill}>
                <Text style={styles.pageNumText}>Page {page.page_number}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => handleExportImage(page)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="share-outline"
                  size={15}
                  color={C.accent}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: page.image_uri }}
                style={styles.pageImage}
                resizeMode="contain"
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.toolbar, { paddingBottom: insets.bottom + S.sm }]}>
        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={() =>
            router.push({ pathname: "/scan", params: { docId: doc.id } })
          }
          activeOpacity={0.7}
        >
          <View style={[styles.toolbarIcon, styles.toolbarIconAccent]}>
            <Ionicons name="add" size={18} color={C.accent} />
          </View>
          <Text style={[styles.toolbarLabel, { color: C.accent }]}>Add</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSep} />

        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={handleExportPdf}
          activeOpacity={0.7}
        >
          <View style={[styles.toolbarIcon, styles.toolbarIconSuccess]}>
            <Ionicons name="document-text-outline" size={18} color={C.success} />
          </View>
          <Text style={[styles.toolbarLabel, { color: C.success }]}>PDF</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSep} />

        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <View style={[styles.toolbarIcon, styles.toolbarIconError]}>
            <Ionicons name="trash-outline" size={18} color={C.error} />
          </View>
          <Text style={[styles.toolbarLabel, { color: C.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  centered: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: S.md,
  },
  loadingText: { fontSize: SIZE.md, color: C.textMuted },
  notFoundText: { fontSize: SIZE.lg, color: C.textMuted },

  scrollContent: { paddingHorizontal: S.lg, paddingTop: S.md },

  nameRow: { marginBottom: S.sm },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
  },
  nameInput: {
    flex: 1,
    fontSize: SIZE.xl,
    fontWeight: FONT.bold,
    color: C.text,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.accent,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: S.sm + S.xs,
  },
  confirmBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: R.md,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  nameTouchable: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: S.sm,
  },
  docName: {
    flex: 1,
    fontSize: SIZE.xl,
    fontWeight: FONT.bold,
    color: C.text,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  editBadge: {
    marginTop: S.xs,
    width: 28,
    height: 28,
    borderRadius: R.sm,
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  metaBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: S.lg,
    gap: S.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.xs,
  },
  metaText: { fontSize: SIZE.sm, color: C.textMuted, fontWeight: FONT.medium },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.textMuted,
  },

  pageCard: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: S.lg,
    overflow: "hidden",
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: S.md,
    paddingBottom: 0,
  },
  pageNumPill: {
    backgroundColor: C.bg,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: S.sm + S.xs,
    paddingVertical: S.xs,
  },
  pageNumText: {
    fontSize: SIZE.xs,
    fontWeight: FONT.semibold,
    color: C.textSecondary,
    letterSpacing: 0.3,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: R.sm,
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    backgroundColor: C.surface,
    paddingVertical: S.sm,
    marginTop: S.sm,
  },
  pageImage: {
    width: "100%",
    height: 280,
  },

  toolbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: S.sm,
    paddingHorizontal: S.sm,
  },
  toolbarBtn: {
    flex: 1,
    alignItems: "center",
    gap: S.xs,
    paddingVertical: S.sm,
    minHeight: TOUCH,
    justifyContent: "center",
  },
  toolbarIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarIconAccent: {
    backgroundColor: C.accentSoft,
  },
  toolbarIconSuccess: {
    backgroundColor: C.successSoft,
  },
  toolbarIconError: {
    backgroundColor: C.errorSoft,
  },
  toolbarLabel: {
    fontSize: SIZE.xs,
    fontWeight: FONT.semibold,
    letterSpacing: 0.1,
  },
  toolbarSep: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: S.sm,
  },
});
