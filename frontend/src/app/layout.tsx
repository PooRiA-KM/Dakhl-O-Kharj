import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "دخل و خرج",
  description: "مدیریت دخل و خرج شخصی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}