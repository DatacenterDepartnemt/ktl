import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt"; // ✅ อย่าลืม import bcrypt

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_key_change_me",
    );
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch (err) {
    return null;
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, email, phone, lineId, password } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // เตรียมข้อมูลอัปเดต
    const updateData: any = {
      name,
      email,
      phone,
      lineId,
      updatedAt: new Date(),
    };

    // ✅ ถ้ามีการส่งรหัสผ่านใหม่มา ให้ Hash แล้วบันทึก
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

    return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ" });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
