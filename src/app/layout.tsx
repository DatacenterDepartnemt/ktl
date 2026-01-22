import type { Metadata } from "next";
import { Kanit } from "next/font/google"; // 1. import Kanit
import "./globals.css";

// 2. ตั้งค่าฟอนต์
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KTLTC - วิทยาลัยเทคนิคกันทรลักษ์",
  description: "ระบบบริหารจัดการข่าวสารและข้อมูลวิทยาลัย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      {/* 3. เรียกใช้ฟอนต์ตรง body */}
      <body className={`${kanit.className}  `}>{children}</body>
    </html>
  );
}
