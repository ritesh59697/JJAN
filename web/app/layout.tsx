import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Jjan: trustless 곗돈 on GIWA",
  description: "Save with friends on-chain. No organizer can run off with the pot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // next-themes sets data-theme on <html> before paint, which the server can't
    // predict — suppressHydrationWarning keeps React from flagging that diff.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
