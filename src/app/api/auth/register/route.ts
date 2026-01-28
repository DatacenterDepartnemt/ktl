import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    // 1. รับค่าจากหน้าบ้าน (เพิ่ม phone, lineId)
    const { username, password, name, email, phone, lineId } = await req.json();

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!username || !password || !name || !email || !phone) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 3. เช็คว่ามี Username หรือ Email นี้อยู่แล้วหรือไม่
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 },
      );
    }

    // 4. เข้ารหัสรหัสผ่าน (Hash Password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. เตรียมข้อมูลผู้ใช้ใหม่ (เพิ่ม phone, lineId ลงในนี้)
    const newUser = {
      username,
      password: hashedPassword,
      name,
      email,
      phone, // ✅ เพิ่มเบอร์โทร
      lineId: lineId || "", // ✅ เพิ่ม Line ID (ถ้าไม่กรอกให้เป็นค่าว่าง)
      role: "editor", // บังคับให้เป็น Editor ก่อน (รอ Super Admin อนุมัติ)
      isActive: false, // บังคับให้รอการอนุมัติ
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 6. บันทึกลงฐานข้อมูล
    await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      { message: "สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติ" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}
