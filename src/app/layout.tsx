import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import "./globals.css";
import Web3AuthRootProvider from "@/components/providers/Web3AuthRootProvider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Juzly - Baca Quran dengan Reward di Blockchain",
  description:
    "Aplikasi baca Alquran web3 berbasis Solana dengan konsep read to earn. Jadikan Muslim super app untuk masa depan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} antialiased`}
      >
        <Web3AuthRootProvider>
          <Navbar />
          {children}
        </Web3AuthRootProvider>
      </body>
    </html>
  );
}
