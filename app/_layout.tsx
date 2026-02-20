import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  initialRouteName: "tabs",
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "fade",
          animationDuration: 180,
          gestureEnabled: false,
        }}
      >
        {/* Αυτό λέει στο Stack να χρησιμοποιήσει το tabs layout */}
        <Stack.Screen name="tabs" />
      </Stack>
    </SafeAreaProvider>
  );
}