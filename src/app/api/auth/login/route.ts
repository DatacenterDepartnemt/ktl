import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const user = await db.collection("users").findOne({ username });
    if (!user)
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 401 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return NextResponse.json({ error: "รหัสผ่านผิด" }, { status: 401 });

    const cookieStore = await cookies();

    // 1. Token (สำคัญมาก)
    cookieStore.set("auth_token", "secure_session", {
      httpOnly: true,
      path: "/",
    });

    // 2. [จุดสำคัญ] Username Cookie -> ต้องมีบรรทัดนี้ Navbar ถึงจะเห็นชื่อ!
    cookieStore.set("username", user.username, {
      httpOnly: true,
      path: "/",
      maxAge: 86400, // 1 วัน
    });

    return NextResponse.json({ success: true });
  } catch  {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
