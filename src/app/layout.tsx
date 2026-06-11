import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LitioCeldas WA Manager",
  description: "WhatsApp CRM para LitioCeldas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
