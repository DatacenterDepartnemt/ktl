import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password, name } = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. ตรวจสอบว่ามี User นี้อยู่ในระบบหรือยัง
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username นี้ถูกใช้งานแล้ว" },
        { status: 400 },
      );
    }

    // 2. เข้ารหัสรหัสผ่าน (Hash Password)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. บันทึกลงฐานข้อมูล
    const result = await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      name,
      role: "admin", // กำหนดสิทธิ์เป็น admin สำหรับระบบ CMS
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลงทะเบียน" },
      { status: 500 },
    );
  }
}
