"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { uploadToCloudinary } from "@/lib/upload";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

// ✅ Cast type เป็น any เพื่อแก้ปัญหา TypeScript กับ SunEditor
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

const fontList = [
  "Sarabun",
  "Kanit",
  "Prompt",
  "Mitr",
  "Taviraj",
  "Chakra Petch",
  "Bai Jamjuree",
  "Mali",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Arial",
  "Courier New",
  "Georgia",
  "Tahoma",
  "Verdana",
];

const CATEGORIES = [
  { value: "PR", label: "ข่าวประชาสัมพันธ์" },
  { value: "Newsletter", label: "จดหมายข่าวประชาสัมพันธ์" },
  { value: "Internship", label: "นักศึกษาออกฝึกประสบการณ์" },
  { value: "Announcement", label: "ข่าวประกาศ" },
  { value: "Bidding", label: "ข่าวประกวดราคา" },
  { value: "Order", label: "คำสั่งวิทยาลัยเทคนิค" },
];

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // --- 1. รูปภาพทั่วไป ---
  const [images, setImages] = useState<string[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);

  // --- ✅ 2. รูปภาพจดหมายข่าว (เพิ่มใหม่) ---
  const [newsletterImages, setNewsletterImages] = useState<string[]>([]);
  const [newNewsletterFile, setNewNewsletterFile] = useState<File | null>(null);

  const toggleCategory = (value: string) => {
    setCategories((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // --- Fetch Data ---
  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);

        // จัดการหมวดหมู่
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (data.category) {
          setCategories([data.category]);
        } else {
          setCategories(["PR"]);
        }

        // เซ็ตค่ารูปภาพเดิมจาก Database
        setImages(data.images || []);
        // ✅ เซ็ตค่ารูปจดหมายข่าวเดิม
        setNewsletterImages(data.announcementImages || []);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        router.push("/dashboard/news");
      });
  }, [id, router]);

  // --- Handlers: ลบรูป ---
  const handleDeleteImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleDeleteNewsletterImage = (indexToRemove: number) => {
    setNewsletterImages(
      newsletterImages.filter((_, index) => index !== indexToRemove),
    );
  };

  // --- Submit Update ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. จัดการรูปทั่วไป
      let finalImages = [...images];
      if (newFile) {
        // ถ้ามีการเลือกไฟล์ใหม่ ให้อัปโหลดและเพิ่มต่อท้าย
        const uploadedUrl = await uploadToCloudinary(newFile, "ktltc_news");
        if (uploadedUrl) {
          finalImages = [...finalImages, uploadedUrl];
        }
      }

      // ✅ 2. จัดการรูปจดหมายข่าว
      let finalNewsletterImages = [...newsletterImages];
      if (newNewsletterFile) {
        const uploadedUrl = await uploadToCloudinary(
          newNewsletterFile,
          "ktltc_newsletter",
        );
        if (uploadedUrl) {
          finalNewsletterImages = [...finalNewsletterImages, uploadedUrl];
        }
      }

      // 3. ส่งข้อมูลไป API
      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          categories,
          images: finalImages,
          announcementImages: finalNewsletterImages, // ✅ ส่งฟิลด์ใหม่ไปด้วย
        }),
      });

      if (res.ok) {
        alert("✅ อัปเดตข่าวเรียบร้อย");
        router.push("/dashboard/news");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("❌ เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-zinc-500">กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans text-zinc-800">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600&display=swap");
        .sun-editor-editable {
          font-family: "Sarabun", sans-serif !important;
        }
      `}</style>

      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200">
          <h1 className="text-3xl font-black text-zinc-900">แก้ไขข่าวสาร</h1>
          <Link
            href="/dashboard/news"
            className="text-zinc-500 hover:text-blue-600 font-bold"
          >
            ← กลับ
          </Link>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200">
          <form onSubmit={handleUpdate} className="space-y-8">
            {/* --- ส่วนที่ 1: รูปภาพทั่วไป --- */}
            <div>
              <label className="block text-sm font-bold text-zinc-600 mb-3 border-l-4 border-blue-500 pl-2">
                รูปภาพทั่วไป ({images.length})
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-video rounded-xl overflow-hidden border border-zinc-200"
                    >
                      <Image
                        src={img}
                        alt={`img-${idx}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="ลบรูปนี้"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm font-bold text-zinc-700">
                    + เพิ่มรูปภาพทั่วไปใหม่
                  </p>
                  <p className="text-xs text-zinc-400">
                    รูปจะถูกเพิ่มต่อท้ายรายการเดิม
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* --- ✅ ส่วนที่ 2: รูปภาพจดหมายข่าว (เพิ่มใหม่) --- */}
            <div>
              <label className="block text-sm font-bold text-zinc-600 mb-3 border-l-4 border-orange-500 pl-2">
                รูปภาพจดหมายข่าว / คำสั่ง ({newsletterImages.length})
              </label>
              {newsletterImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {newsletterImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-3/4 rounded-xl overflow-hidden border border-orange-200 shadow-sm bg-slate-50"
                    >
                      <Image
                        src={img}
                        alt={`newsletter-${idx}`}
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteNewsletterImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="ลบรูปนี้"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <div className="absolute bottom-0 w-full bg-orange-500/80 text-white text-[10px] text-center py-1">
                        รูปจดหมายข่าว
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-orange-50/30 rounded-xl border-2 border-dashed border-orange-200">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm font-bold text-orange-700">
                    + เพิ่มรูปจดหมายข่าวใหม่
                  </p>
                  <p className="text-xs text-orange-400">
                    สำหรับรูปประกาศ คำสั่ง หรือจดหมายข่าวแนวตั้ง
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewNewsletterFile(e.target.files?.[0] || null)
                  }
                  className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                />
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* --- ส่วนที่ 3: ข้อมูลอื่นๆ (Title, Categories, Content) --- */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-600">
                  หัวข้อข่าว
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-zinc-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-600">
                  หมวดหมู่
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const isSelected = categories.includes(cat.value);
                    return (
                      <div
                        key={cat.value}
                        onClick={() => toggleCategory(cat.value)}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-zinc-300"}`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="font-bold text-sm">{cat.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-600">
                เนื้อหาข่าว
              </label>
              <div className="rounded-xl overflow-hidden border border-zinc-200 sun-editor-wrapper">
                <SunEditor
                  setContents={content}
                  onChange={setContent}
                  height="400px"
                  setOptions={{
                    font: fontList,
                    buttonList: [
                      ["undo", "redo"],
                      ["font", "fontSize", "formatBlock"],
                      ["bold", "underline", "italic", "strike"],
                      ["fontColor", "hiliteColor"],
                      ["removeFormat"],
                      ["outdent", "indent"],
                      ["align", "horizontalRule", "list", "lineHeight"],
                      ["table", "link", "image", "video"],
                      ["fullScreen", "showBlocks", "codeView"],
                    ],
                    defaultTag: "div",
                    minHeight: "400px",
                  }}
                />
              </div>
            </div>

            {/* --- Buttons --- */}
            <div className="pt-6 flex gap-4 border-t border-zinc-100 mt-8">
              <Link
                href="/dashboard/news"
                className="px-6 py-4 rounded-xl border-2 border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50 transition-colors"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                  submitting
                    ? "bg-zinc-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
              >
                {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
