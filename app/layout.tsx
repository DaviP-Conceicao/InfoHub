import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://infohub-production-78c5.up.railway.app"),
  title: {
    default: "InfoHub — Informação útil e estruturada",
    template: "%s | InfoHub",
  },
  description:
    "Informação útil, estruturada e acessível para pessoas, desenvolvedores e sistemas de inteligência artificial.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "InfoHub",
    title: "InfoHub — Informação útil e estruturada",
    description:
      "Informação útil, estruturada e acessível para pessoas, desenvolvedores e sistemas de inteligência artificial.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
