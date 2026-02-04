import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// --- GET: ดึงข้อมูลรายตัว ---
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Next.js 15 ต้อง await params

    // ตรวจสอบว่า ID ถูกต้องตามรูปแบบ MongoDB
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const news = await db.collection("news").findOne({ _id: new ObjectId(id) });

    if (!news) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// --- PUT: แก้ไขข้อมูล ---
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // รับค่า field ต่างๆ จาก Frontend
    const {
      title,
      categories,
      content,
      images,
      announcementImages,
      links,
      videoEmbeds, // ✅ รับค่า videoEmbeds
    } = await req.json();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // อัปเดตข้อมูล
    const result = await db.collection("news").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          categories,
          category: categories[0], // อัปเดต category หลัก
          content,
          images: images || [],
          announcementImages: announcementImages || [],
          links: links || [],
          videoEmbeds: videoEmbeds || [], // ✅ อัปเดต videoEmbeds
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลที่จะแก้ไข" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "แก้ไขล้มเหลว" }, { status: 500 });
  }
}

// --- DELETE: ลบข่าว ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("news").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "ลบสำเร็จ" });
    }
    return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบ" },
      { status: 500 },
    );
  }
}
