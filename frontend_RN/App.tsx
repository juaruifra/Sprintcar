import * as React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Login from "./src/app/(auth)/Login";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Login />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

