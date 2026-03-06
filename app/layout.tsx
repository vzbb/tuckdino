import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tucker & Baby Dino",
  description: "A cozy 3D companion adventure for Tucker 🦕",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
