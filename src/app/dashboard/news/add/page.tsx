"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// กำหนดรายการหมวดหมู่ใหม่ที่นี่
const CATEGORIES = [
  { value: "PR", label: "ข่าวประชาสัมพันธ์" },
  { value: "Newsletter", label: "จดหมายข่าวประชาสัมพันธ์" },
  { value: "Internship", label: "นักศึกษาออกฝึกประสบการณ์" },
  { value: "Announcement", label: "ข่าวประกาศ" },
  { value: "Bidding", label: "ข่าวประกวดราคา" },
  { value: "Order", label: "คำสั่งวิทยาลัยเทคนิค" },
];

export default function AddNewsPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PR"); // ค่าเริ่มต้น
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ... (ฟังก์ชัน handleImageChange และ removeImage เหมือนเดิม) ...
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 2 * 1024 * 1024) continue;
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newImages.push(base64);
      }
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content, images }),
      });

      if (res.ok) {
        alert("บันทึกข่าวเรียบร้อยแล้ว!");
        router.refresh();
        router.push("/dashboard/news");
      } else {
        alert("เกิดข้อผิดพลาด");
      }
    } catch {
      alert("เชื่อมต่อ Server ไม่ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <Link
            href="/dashboard/news"
            className="text-zinc-400 hover:text-white"
          >
            ← กลับ
          </Link>
          <h1 className="text-3xl font-bold">สร้างข่าวใหม่</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ส่วนอัปโหลดรูป (เหมือนเดิม) */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-400 uppercase">
              รูปภาพประกอบ ({images.length} รูป)
            </label>
            <div className="relative w-full h-32 border-2 border-dashed border-zinc-700 bg-zinc-900/50 rounded-2xl hover:border-blue-500 transition-all cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 group-hover:text-blue-400">
                <span className="font-bold text-sm">
                  คลิกเพื่อเพิ่มรูปภาพ (เลือกได้หลายรูป)
                </span>
              </div>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-xl overflow-hidden border border-zinc-700"
                  >
                    <Image
                      src={img}
                      alt="preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase">
                หัวข้อข่าว
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white"
                required
              />
            </div>

            {/* --- แก้ไขจุดเลือกหมวดหมู่ --- */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase">
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase">
                เนื้อหาข่าว
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
            <Link
              href="/dashboard/news"
              className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold"
            >
              {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
