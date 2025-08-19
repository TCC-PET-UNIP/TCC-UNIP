import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" backgroundColor="#B87B56" translucent={false} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#B87B56" },
        }}
      />
    </SafeAreaProvider>
  );
}
