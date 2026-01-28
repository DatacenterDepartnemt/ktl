import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// ✅ PATCH: แก้ไขสถานะ
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // รองรับ Next.js 15
) {
  try {
    const { id } = await params; // แกะ ID ออกมา
    const body = await req.json();
    const { isActive, role } = body;

    console.log(`⚡ Updating User: ${id}`, body); // ดู Log ใน Terminal

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const updateData: any = { updatedAt: new Date() };
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (role) updateData.role = role;

    // อัปเดตข้อมูล
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      console.warn("⚠️ No documents updated. ID might be wrong.");
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("❌ Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE: ลบผู้ใช้
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
