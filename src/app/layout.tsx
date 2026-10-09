import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMS Landing Page",
  description: "A server-rendered CMS-powered landing page."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}