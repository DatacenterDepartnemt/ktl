import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

// --- POST: สร้างข่าวใหม่ ---
export async function POST(request: Request) {
  try {
    // 1. รับค่า videoEmbeds เข้ามาด้วย
    const {
      title,
      categories,
      content,
      images,
      announcementImages,
      links,
      videoEmbeds, // ✅ เพิ่มตรงนี้
    } = await request.json();

    // Validation
    if (
      !title ||
      !categories ||
      !Array.isArray(categories) ||
      categories.length === 0 ||
      !content
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // เตรียมข้อมูลบันทึก
    const newNews = {
      title,
      categories,
      category: categories[0], // เก็บ category แรกเป็นหลัก
      content,
      images: images || [],
      announcementImages: announcementImages || [],
      links: links || [],

      // ✅ บันทึก Video Embeds (ถ้าไม่มีให้เป็น array ว่าง)
      videoEmbeds: videoEmbeds || [],

      createdAt: new Date(),
      status: "published",
    };

    // บันทึกลง Database
    const result = await db.collection("news").insertOne(newNews);

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// --- GET: ดึงรายการข่าว (Load More) ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "15");

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงข้อมูลข่าวแบบแบ่งหน้า
    const news = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection("news").countDocuments();

    return NextResponse.json({ news, total });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
