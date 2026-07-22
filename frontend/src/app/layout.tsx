import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DemoTour from "@/components/DemoTour";
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
  title: "FieldBack — athlete injury triage",
  description:
    "Athletes log pain in plain words, coaches see the roster-wide picture. Cursor Boston Sports Hack demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <DemoTour />
      </body>
    </html>
  );
}
