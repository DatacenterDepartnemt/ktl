import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    // ----------------------------------------------------------------
    // 1. 🔒 ตรวจสอบสิทธิ์ (Security Check)
    // ----------------------------------------------------------------
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_key_change_me",
    );

    // แกะ Token
    const { payload } = await jwtVerify(token, secret);

    // เช็ค Role: ต้องเป็น Super Admin เท่านั้น
    if (payload.role !== "super_admin") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // ----------------------------------------------------------------
    // 2. 📡 ดึงข้อมูลจาก Database
    // ----------------------------------------------------------------
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const users = await db
      .collection("users")
      .find({})
      // ✅✅ จุดสำคัญ: เรียงตาม orderIndex (ลำดับที่บันทึก) ก่อน
      // ถ้าไม่มี orderIndex ให้เรียงตามเวลาที่สมัคร (createdAt) จากใหม่ไปเก่า
      .sort({ orderIndex: 1, createdAt: -1 })
      .project({ password: 0 }) // ปิดบังรหัสผ่าน
      .toArray();

    // ----------------------------------------------------------------
    // 3. 🛠️ แปลงข้อมูล (Transform Data)
    // ----------------------------------------------------------------
    const safeUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(), // แปลง ObjectId เป็น String เพื่อกันบั๊ก Frontend
    }));

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
