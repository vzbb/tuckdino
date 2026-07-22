import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rawrcade",
  description: "Raise a dinosaur. Train together. Explore a wild little world.",
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
