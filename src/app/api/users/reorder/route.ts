import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { users } = body; // รับ Array ของ User ที่เรียงใหม่แล้ว

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ใช้ bulkWrite เพื่ออัปเดตหลายคนพร้อมกัน (เร็วกว่าวน loop update ทีละคน)
    const operations = users.map((user: any, index: number) => ({
      updateOne: {
        filter: { _id: new ObjectId(user._id) },
        update: { $set: { orderIndex: index } }, // บันทึกลำดับตาม Array index (0, 1, 2...)
      },
    }));

    if (operations.length > 0) {
      await db.collection("users").bulkWrite(operations);
    }

    return NextResponse.json({ message: "Reordered successfully" });
  } catch (error) {
    console.error("Reorder Error:", error);
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }
}
