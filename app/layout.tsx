import type { Metadata } from "next";
import "7.css/dist/7.scoped.css";
import { DesktopShell } from "@/components/desktop/desktop-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Anthony's Desktop", template: "%s | Anthony's Desktop" },
  description: "Anthony's personal desktop: software, projects, writing, and travel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body><DesktopShell>{children}</DesktopShell></body></html>;
}
