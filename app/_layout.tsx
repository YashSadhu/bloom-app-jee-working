import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl || convexUrl.trim() === "") {
  throw new Error("Missing EXPO_PUBLIC_CONVEX_URL environment variable. Please set it in your environment.");
}

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack screenOptions={{ headerShown: false }} />
    </ConvexProvider>
  );
}
