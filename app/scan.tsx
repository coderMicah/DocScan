import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDocuments } from "../src/contexts/DocumentsContext";
import { useSettings } from "../src/contexts/SettingsContext";
import { addPage, createDocument, getDocument } from "../src/db/operations";
import { generateDocName } from "../src/lib/constants";
import { C, FONT, R, S, SIZE } from "../src/lib/theme";
import { scanPages } from "../src/services/scanner";
import { saveImage } from "../src/services/storage";

function PulsingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        styles.pulseDot,
        {
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
        },
      ]}
    />
  );
}

function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ docId?: string }>();
  const { addDocument } = useDocuments();
  const { maxPages } = useSettings();
  const [status, setStatus] = useState<"scanning" | "processing" | "error">(
    "scanning"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function run() {
      try {
        const result = await scanPages({ maxNumDocuments: maxPages });

        if (cancelledRef.current) return;

        if (result.cancelled || result.pages.length === 0) {
          router.back();
          return;
        }

        setStatus("processing");

        const existingDocId = params.docId ? Number(params.docId) : null;

        if (existingDocId) {
          const existingDoc = await getDocument(existingDocId);
          if (!existingDoc) {
            router.back();
            return;
          }

          const startPage = existingDoc.pages.length + 1;
          for (let i = 0; i < result.pages.length; i++) {
            const uri = result.pages[i];
            const savedUri = await saveImage(uri, existingDocId, startPage + i);
            await addPage(existingDocId, startPage + i, savedUri);
          }

          if (!cancelledRef.current) {
            router.replace(`/document/${existingDocId}`);
          }
        } else {
          const docName = generateDocName();
          const docId = await createDocument(docName);

          for (let i = 0; i < result.pages.length; i++) {
            const uri = result.pages[i];
            const savedUri = await saveImage(uri, docId, i + 1);
            await addPage(docId, i + 1, savedUri);
          }

          addDocument({
            id: docId,
            name: docName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (!cancelledRef.current) {
            router.replace(`/document/${docId}`);
          }
        }
      } catch (error: unknown) {
        if (cancelledRef.current) return;
        const message =
          error instanceof Error ? error.message : String(error);
        if (message.toLowerCase().includes("cancel")) {
          router.back();
          return;
        }
        setStatus("error");
        setErrorMsg(message);
        setTimeout(() => router.back(), 2000);
      }
    }

    run();

    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <View style={styles.root}>
        <View style={[styles.iconBox, styles.iconBoxError]}>
          <Ionicons name="alert-circle" size={28} color={C.error} />
        </View>
        <Text style={styles.title}>Scan Failed</Text>
        <Text style={styles.subtitle}>{errorMsg}</Text>
      </View>
    );
  }

  const isProcessing = status === "processing";

  return (
    <View style={styles.root}>
      <View style={styles.iconRow}>
        <PulsingDot delay={0} />
        <View style={[styles.iconBox, styles.iconBoxActive]}>
          <ActivityIndicator size="small" color={C.accent} />
        </View>
        <PulsingDot delay={400} />
      </View>

      <Text style={styles.title}>
        {isProcessing ? "Saving" : "Scanning"}
      </Text>
      <Text style={styles.subtitle}>
        {isProcessing
          ? "Saving your scanned pages"
          : "Opening the document scanner"}
      </Text>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressBar,
            { width: isProcessing ? "70%" : "30%" },
          ]}
        />
      </View>
    </View>
  );
}

export default ScanScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: S.xxl + S.lg,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    marginBottom: S.xxl,
  },
  pulseDot: {
    width: S.sm,
    height: S.sm,
    borderRadius: S.sm / 2,
    backgroundColor: C.accent,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: R.lg,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: {
    backgroundColor: C.accentSoft,
    borderColor: C.accentBorder,
  },
  iconBoxError: {
    backgroundColor: C.errorSoft,
    borderColor: C.errorBorder,
  },
  title: {
    fontSize: SIZE.xxl,
    fontWeight: FONT.bold,
    color: C.text,
    marginBottom: S.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: SIZE.md,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: S.xxl,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: C.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: C.accent,
    borderRadius: 4,
  },
});
