import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../global.css";
import { DocumentsProvider } from "../src/contexts/DocumentsContext";
import { SettingsProvider } from "../src/contexts/SettingsContext";
import { C, FONT } from "../src/lib/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <DocumentsProvider>
      <SettingsProvider>
        <StatusBar style="dark" backgroundColor={C.bg} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: C.bg },
            headerTintColor: C.text,
            headerTitleStyle: {
              fontWeight: FONT.bold,
              color: C.text,
              fontSize: 17,
            },
            headerShadowVisible: false,
            headerBackTitle: "Back",
            contentStyle: { backgroundColor: C.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="scan"
            options={{
              title: "Scan Document",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="document/[id]"
            options={{ title: "Document", headerShown: true }}
          />
          <Stack.Screen
            name="settings"
            options={{ title: "Settings", headerShown: true }}
          />
        </Stack>
      </SettingsProvider>
    </DocumentsProvider>
  );
}
