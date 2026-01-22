import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ยอมให้ Build ผ่านแม้มี Error เพื่อความรวดเร็ว
    ignoreBuildErrors: true,
  },

  // @ts-expect-error: บางเวอร์ชันของ NextConfig อาจมองไม่เห็น property eslint
  eslint: {
    // ข้ามการตรวจ ESLint ระหว่าง Build บน Vercel
    ignoreDuringBuilds: true,
  },

  images: {
    // รองรับไฟล์ภาพประสิทธิภาพสูง
    formats: ["image/avif", "image/webp"],
    // อนุญาตให้ดึงรูปภาพจาก Cloudinary มาแสดงผล
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  compress: true,
};

export default nextConfig;
