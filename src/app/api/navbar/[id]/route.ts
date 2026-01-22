import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    // ต้อง await params ก่อนใช้งานใน Next.js รุ่นใหม่
    const { id } = await params;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("navbar").deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error deleting menu" }, { status: 500 });
  }
}
