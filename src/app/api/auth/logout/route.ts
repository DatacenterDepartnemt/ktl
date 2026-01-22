import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // ลบ Cookie ทั้งหมดที่เกี่ยวกับระบบล็อกอิน
    cookieStore.delete("auth_token");
    cookieStore.delete("username");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
