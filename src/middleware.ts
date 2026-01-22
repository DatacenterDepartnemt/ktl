"proxy";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // แก้ไขจาก next/request เป็น next/server

export function middleware(request: NextRequest) {
  // 1. ดึงข้อมูล Token จาก Cookie
  const token = request.cookies.get("auth_token")?.value;

  // 2. ตรวจสอบเส้นทางที่ต้องการป้องกัน (Dashboard)
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // ถ้าไม่มี Token ให้ส่งกลับไปหน้า Login ทันที
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// กำหนดขอบเขตการทำงานของ Middleware
export const config = {
  matcher: ["/dashboard/:path*"],
};
