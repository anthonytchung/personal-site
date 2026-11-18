import { getSearchEntries } from "@/lib/content/writing";
import type { Metadata } from "next";
import "7.css/dist/7.scoped.css";
import { DesktopShell } from "@/components/desktop/desktop-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://anthonychung.me"),
  title: { default: "Anthony's Desktop", template: "%s | Anthony's Desktop" },
  description: "Anthony's personal desktop: software, projects, writing, and travel.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const searchEntries = await getSearchEntries();
  return <html lang="en"><body><DesktopShell searchEntries={searchEntries}>{children}</DesktopShell></body></html>;
}
