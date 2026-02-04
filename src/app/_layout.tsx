import { ThemeProvider } from "@/components/theme-provider";
import { Slot } from "expo-router";

export default function Layout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}
