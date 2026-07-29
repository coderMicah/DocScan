import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { C, R, S, TOUCH } from "../lib/theme";

const { width, height } = Dimensions.get("window");

type Props = {
  uri: string;
  visible: boolean;
  onClose: () => void;
};

export default function ImagePreview({ uri, visible, onClose }: Props) {
  const [scale, setScale] = useState(1);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <StatusBar barStyle="light-content" />
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.imageContainer}>
          <Image
            source={{ uri }}
            style={[styles.image, { transform: [{ scale }] }]}
            resizeMode="contain"
          />
        </Pressable>

        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={() => setScale((s) => (s === 1 ? 2 : 1))}
            style={styles.zoomBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={scale === 1 ? "search-outline" : "search-outline"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topBar: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: S.lg,
  },
  closeBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: R.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  zoomBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: R.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
