import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";

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
      <body>
        {/* 🔹 Wrap all pages in Suspense so useSearchParams is happy */}
        <Suspense fallback={<div>Loading analytics…</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
