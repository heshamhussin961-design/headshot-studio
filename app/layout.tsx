import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Headshot Studio — AI professional headshots",
  description: "Turn any photo into a professional studio headshot in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
