"use client";

import { useRouter } from "next/navigation";

export default function DeleteNewsBtn({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("🚨 คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?")) {
      try {
        const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
        if (res.ok) {
          router.refresh();
        }
      } catch {
        // ตัด (error) ออกตามต้องการ
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-sm font-bold text-red-500/80 hover:text-red-400 transition-colors"
    >
      ลบข้อมูล
    </button>
  );
}
