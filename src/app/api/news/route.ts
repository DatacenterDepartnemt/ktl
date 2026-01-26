import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { title, categories, content, images, announcementImages, links } =
      await request.json();

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
      // ✅ เก็บหมวดหมู่แรกไว้เป็น category หลัก เพื่อให้ Query ง่ายขึ้นในบางจุด
      category: categories[0],
      content,
      images: images || [],
      announcementImages: announcementImages || [],
      links: links || [],

      // ✅ ใช้ Date Object แทน ISOString เพื่อให้ MongoDB เรียงลำดับ (Sort) ได้แม่นยำและรวดเร็วที่สุด
      createdAt: new Date(),

      // ✅ เพิ่มสถานะ (เผื่ออนาคตทำระบบ Draft/Publish)
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

// ✅ เพิ่มฟังก์ชัน GET เพื่อรองรับการโหลดแบบ Load More (15 เรื่องแรก)
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

    // นับจำนวนทั้งหมดเพื่อเอาไปเช็คในหน้า Frontend ว่าต้องโชว์ปุ่ม "โหลดเพิ่ม" ไหม
    const total = await db.collection("news").countDocuments();

    return NextResponse.json({ news, total });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
