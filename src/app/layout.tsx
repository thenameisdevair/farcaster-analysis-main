import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farcaster Analytics",
  description: "Personal analytics dashboard for your Farcaster account",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
