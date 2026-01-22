"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // 1. นำเข้า Image component
import { uploadToCloudinary } from "@/lib/upload";

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("PR");
  const [images, setImages] = useState<string[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
        setImages(data.images || []);
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedImages = images;

    if (newFile) {
      const uploadedUrl = await uploadToCloudinary(newFile);
      if (uploadedUrl) updatedImages = [uploadedUrl];
    }

    const res = await fetch(`/api/news/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, content, category, images: updatedImages }),
    });

    if (res.ok) {
      alert("อัปเดตข่าวเรียบร้อย");
      router.push("/dashboard/news");
      router.refresh();
    }
  };

  if (loading) return <p className="p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-6">แก้ไขข่าวสาร</h1>
      <form
        onSubmit={handleUpdate}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="หัวข้อข่าว"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="PR">ข่าวประชาสัมพันธ์</option>
          <option value="Announcement">ข่าวประกาศ</option>
          <option value="Order">คำสั่งวิทยาลัย</option>
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-40"
          placeholder="เนื้อหา"
        ></textarea>

        <div className="border-t pt-4">
          <p className="text-sm mb-2 text-gray-500 font-bold">
            รูปภาพปัจจุบัน:
          </p>
          {images[0] && (
            <div className="relative h-48 w-full mb-4 border rounded overflow-hidden">
              {/* 2. เปลี่ยนจาก <img> เป็น <Image /> เพื่อแก้ไข ESLint Warning */}
              <Image
                src={images[0]}
                alt="Preview"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เปลี่ยนรูปภาพใหม่:
          </label>
          <input
            type="file"
            onChange={(e) => setNewFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
          บันทึกการแก้ไข
        </button>
      </form>
    </div>
  );
}
