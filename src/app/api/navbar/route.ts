import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const items = await db
      .collection("navbar")
      .find({})
      .sort({ order: 1 })
      .toArray();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Error fetching navbar" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { label, path, order, parentId } = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("navbar").insertOne({
      label,
      path,
      order: Number(order),
      parentId: parentId && parentId.trim() !== "" ? parentId : null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error creating menu" }, { status: 500 });
  }
}

// --- เพิ่มฟังก์ชัน PUT สำหรับแก้ไขข้อมูล ---
export async function PUT(req: Request) {
  try {
    const { _id, label, path, order, parentId } = await req.json();

    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("navbar").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          label,
          path,
          order: Number(order),
          parentId: parentId && parentId.trim() !== "" ? parentId : null,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error updating menu" }, { status: 500 });
  }
}
