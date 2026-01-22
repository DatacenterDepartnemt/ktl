import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const pages = await db.collection("pages").find({}).toArray();
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { slug, title, content } = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ตรวจสอบว่า slug ซ้ำไหม
    const existing = await db.collection("pages").findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 },
      );
    }

    await db.collection("pages").insertOne({
      slug,
      title,
      content,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { _id, slug, title, content } = await req.json();

    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("pages").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          slug,
          title,
          content,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 },
    );
  }
}
