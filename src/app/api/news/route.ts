import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(request: Request) {
  try {
    // ✅ 1. รับค่าทั้งหมดรวมถึง announcementImages และ links
    const { title, categories, content, images, announcementImages, links } =
      await request.json();

    // Validation: ตรวจสอบข้อมูลจำเป็น
    if (
      !title ||
      !categories ||
      !Array.isArray(categories) ||
      categories.length === 0 ||
      !content
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน (หัวข้อ, หมวดหมู่, เนื้อหา)" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // เตรียมข้อมูลบันทึก
    const newNews = {
      title,
      categories,
      content, // HTML String จาก SunEditor
      images: images || [], // รูปทั่วไป (Array of URLs)

      // ✅ 2. บันทึกรูปจดหมายข่าว (ถ้าไม่มีให้เป็น empty array)
      announcementImages: announcementImages || [],

      // ✅ 3. บันทึกลิงก์ (ถ้าไม่มีให้เป็น empty array)
      links: links || [],

      createdAt: new Date().toISOString(),
    };

    // บันทึกลง Database
    await db.collection("news").insertOne(newNews);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
