"use client"; // 👈 บรรทัดนี้สำคัญที่สุด! ถ้าไม่มี หน้านั้นจะเปิดไม่ได้เลย

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteNewsBtn({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("🚨 คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("ลบไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      {isDeleting ? "กำลังลบ..." : "ลบข้อมูล"}
    </button>
  );
}
