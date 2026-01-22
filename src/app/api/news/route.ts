import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

// 1. ฟังก์ชัน GET: สำหรับดึงรายการข่าวทั้งหมด (ใช้แสดงหน้าแรก และ Dashboard)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงข้อมูลเรียงจากใหม่ไปเก่า (createdAt: -1)
    const news = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(news);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 },
    );
  }
}

// 2. ฟังก์ชัน POST: สำหรับเพิ่มข่าวใหม่ (นี่คือส่วนที่คุณขาดไป!)
export async function POST(req: Request) {
  try {
    const body = await req.json(); // รับข้อมูลที่ส่งมาจากฟอร์ม
    const { title, category, content, images } = body;

    // ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and Category are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // บันทึกลงฐานข้อมูล
    const newNews = await db.collection("news").insertOne({
      title,
      category,
      content: content || "", // ถ้าไม่มี content ให้ใส่เป็นว่าง
      images: images || [], // ถ้าไม่มีรูป ให้ใส่อาร์เรย์ว่าง
      createdAt: new Date(), // บันทึกเวลาปัจจุบัน
    });

    return NextResponse.json({
      success: true,
      message: "News created successfully",
      id: newNews.insertedId,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 },
    );
  }
}
