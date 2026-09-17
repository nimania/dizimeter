import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "دیزی‌متر | ریتینگ و ری‌کپ سریال‌های ترکی", template: "%s | دیزی‌متر" },
  description: "مرجع فارسی و خودکار ریتینگ، ری‌کپ و اطلاعات سریال‌های ترکی.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
