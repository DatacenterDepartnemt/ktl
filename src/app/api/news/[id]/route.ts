import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// ฟังก์ชันสำหรับลบข่าว (DELETE) - ที่คุณกำลังขาดอยู่
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // ต้อง await params ใน Next.js รุ่นใหม่
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // แปลง id เป็น ObjectId ของ MongoDB
    const result = await db.collection("news").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "ลบสำเร็จ" });
    }
    return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลรายตัว (GET) - สำหรับหน้าแก้ไข
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const news = await db.collection("news").findOne({ _id: new ObjectId(id) });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// ฟังก์ชันสำหรับแก้ไข (PUT) - สำหรับหน้าแก้ไข
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // อัปเดตข้อมูล (updatedAt จะเปลี่ยนเวลาอัตโนมัติ)
    const result = await db
      .collection("news")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...body, updatedAt: new Date() } },
      );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "แก้ไขล้มเหลว" }, { status: 500 });
  }
}
