import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Parents Supporter",
  description: "A new simple game to play with your children, every day. / Ogni giorno un gioco semplice da fare con i tuoi bambini.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2f6f66",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
