import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LitioCeldas WA Manager",
  description: "WhatsApp CRM para LitioCeldas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`h-full ${inter.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
