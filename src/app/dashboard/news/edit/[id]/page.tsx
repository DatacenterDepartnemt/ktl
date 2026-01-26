/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { uploadToCloudinary } from "@/lib/upload";
import "suneditor/dist/css/suneditor.min.css";

// --- Config ---
const CATEGORIES = [
  {
    value: "PR",
    label: "ข่าวประชาสัมพันธ์",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    value: "Newsletter",
    label: "จดหมายข่าว",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    value: "Internship",
    label: "ฝึกงาน/ประสบการณ์",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    value: "Announcement",
    label: "ข่าวประกาศ",
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    value: "Bidding",
    label: "ประกวดราคา",
    color: "bg-pink-50 text-pink-600 border-pink-200",
  },
  {
    value: "Order",
    label: "คำสั่งวิทยาลัย",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
];

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

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [SunEditorComponent, setSunEditorComponent] =
    useState<React.ComponentType<any> | null>(null);

  // States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const [images, setImages] = useState<string[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null); // ไฟล์ใหม่ที่รออัปโหลด

  const [newsletterImages, setNewsletterImages] = useState<string[]>([]);
  const [newNewsletterFile, setNewNewsletterFile] = useState<File | null>(null); // ไฟล์ใหม่ที่รออัปโหลด

  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [currentLink, setCurrentLink] = useState({ label: "", url: "" });

  useEffect(() => {
    import("suneditor-react").then((mod) =>
      setSunEditorComponent(() => mod.default),
    );
  }, []);

  // Fetch Data
  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (data.category) {
          setCategories([data.category]);
        } else {
          setCategories(["PR"]);
        }
        setImages(data.images || []);
        setNewsletterImages(data.announcementImages || []);
        setLinks(data.links || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        router.push("/dashboard/news");
      });
  }, [id, router]);

  // Handlers
  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value)
        ? prev.length === 1
          ? prev
          : prev.filter((c) => c !== value)
        : [...prev, value],
    );
  };

  // จัดการรูปภาพทั่วไป (ลบของเก่า / เพิ่มของใหม่)
  const handleDeleteImage = (index: number) =>
    setImages(images.filter((_, i) => i !== index));
  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setNewFile(e.target.files[0]);
  };

  // จัดการจดหมายข่าว (ลบของเก่า / เพิ่มของใหม่)
  const handleDeleteNewsletter = (index: number) =>
    setNewsletterImages(newsletterImages.filter((_, i) => i !== index));
  const handleNewNewsletterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.[0]) setNewNewsletterFile(e.target.files[0]);
  };

  const addLink = () => {
    if (!currentLink.label || !currentLink.url) return alert("กรุณากรอกให้ครบ");
    setLinks([...links, currentLink]);
    setCurrentLink({ label: "", url: "" });
  };
  const removeLink = (index: number) =>
    setLinks(links.filter((_, i) => i !== index));

  // Update Logic
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // 1. อัปโหลดรูปใหม่ (ถ้ามี)
      const finalImages = [...images];
      if (newFile) {
        const url = await uploadToCloudinary(newFile, "ktltc_news");
        if (url) finalImages.push(url);
      }

      const finalNewsletterImages = [...newsletterImages];
      if (newNewsletterFile) {
        const url = await uploadToCloudinary(
          newNewsletterFile,
          "ktltc_newsletters",
        );
        if (url) finalNewsletterImages.push(url);
      }

      // 2. ส่งข้อมูลอัปเดต
      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          categories,
          images: finalImages,
          announcementImages: finalNewsletterImages,
          links,
        }),
      });

      if (res.ok) {
        alert("✅ อัปเดตเรียบร้อย!");
        router.push("/dashboard/news");
        router.refresh();
      } else {
        alert("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error(error);
      alert("เชื่อมต่อ Server ไม่ได้");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32 font-sans text-slate-800 relative">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap");
        body {
          font-family: "Sarabun", sans-serif;
        }
        .sun-editor-editable {
          font-family: "Sarabun", sans-serif !important;
        }
        .sun-editor {
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0 !important;
          overflow: hidden;
        }
      `}</style>

      {/* --- Top Bar --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/news"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">แก้ไขข่าวสาร</h1>
              <p className="text-xs text-slate-500">
                ปรับปรุงข้อมูลข่าวประชาสัมพันธ์
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* --- Card 1: ข้อมูลหลัก --- */}
        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
              ✏️
            </div>
            <h2 className="text-lg font-bold text-slate-700">รายละเอียดข่าว</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 ml-1">
                หัวข้อข่าว
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-lg font-semibold text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-500 ml-1">
                หมวดหมู่
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = categories.includes(cat.value);
                  return (
                    <div
                      key={cat.value}
                      onClick={() => toggleCategory(cat.value)}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group overflow-hidden ${
                        isSelected
                          ? `${cat.color} ring-2 ring-offset-1 ring-blue-100`
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-current bg-current" : "border-slate-300"}`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={4}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="font-bold text-sm">{cat.label}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-current opacity-[0.03]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 ml-1">
                เนื้อหาข่าว
              </label>
              <div className="rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {SunEditorComponent ? (
                  <SunEditorComponent
                    setContents={content}
                    onChange={setContent}
                    height="400px"
                    setOptions={{
                      font: fontList,
                      buttonList: [
                        ["undo", "redo"],
                        ["font", "fontSize", "formatBlock"],
                        [
                          "bold",
                          "underline",
                          "italic",
                          "strike",
                          "fontColor",
                          "hiliteColor",
                        ],
                        [
                          "removeFormat",
                          "outdent",
                          "indent",
                          "align",
                          "list",
                          "lineHeight",
                          "horizontalRule",
                        ],
                        [
                          "table",
                          "link",
                          "image",
                          "video",
                          "fullScreen",
                          "showBlocks",
                          "codeView",
                        ],
                      ],
                      defaultTag: "div",
                      minHeight: "400px",
                    }}
                  />
                ) : (
                  <div className="h-[400px] flex items-center justify-center bg-slate-50 text-slate-400 animate-pulse">
                    กำลังโหลด...
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- Card 2: รูปภาพทั่วไป --- */}
        <section className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                🖼️
              </span>
              รูปภาพทั่วไป
            </h3>
            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
              แนวนอน
            </span>
          </div>

          {/* แสดงรูปเดิม */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-xl overflow-hidden shadow-sm group border border-slate-200"
              >
                <Image src={img} alt="img" fill className="object-cover" />
                <button
                  onClick={() => handleDeleteImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  ×
                </button>
              </div>
            ))}
            {/* ช่องอัปโหลดเพิ่ม */}
            <div className="relative group cursor-pointer aspect-video border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all flex flex-col items-center justify-center overflow-hidden">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleNewFileChange}
              />
              {newFile ? (
                <div className="relative w-full h-full">
                  <Image
                    src={URL.createObjectURL(newFile)}
                    alt="new"
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs font-bold">
                    รออัปโหลด
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-1 text-blue-500">
                    +
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    เพิ่มรูปใหม่
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* --- Card 3: จดหมายข่าว --- */}
        <section className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                📜
              </span>
              จดหมายข่าว
            </h3>
            <span className="text-xs font-medium bg-purple-50 text-purple-600 px-2 py-1 rounded-md">
              แนวตั้ง
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {newsletterImages.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm group border border-slate-200 bg-slate-100"
              >
                <Image
                  src={img}
                  alt="newsletter"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={() => handleDeleteNewsletter(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  ×
                </button>
              </div>
            ))}

            <div className="relative group cursor-pointer aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-400 transition-all flex flex-col items-center justify-center overflow-hidden">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleNewNewsletterChange}
              />
              {newNewsletterFile ? (
                <div className="relative w-full h-full">
                  <Image
                    src={URL.createObjectURL(newNewsletterFile)}
                    alt="new"
                    fill
                    className="object-contain opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs font-bold">
                    รออัปโหลด
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-1 text-purple-500">
                    +
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    เพิ่มรูปใหม่
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* --- Card 4: ลิงก์ --- */}
        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
              🔗
            </div>
            <h2 className="text-lg font-bold text-slate-700">ลิงก์ภายนอก</h2>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-3">
            <input
              placeholder="ชื่อปุ่ม"
              value={currentLink.label}
              onChange={(e) =>
                setCurrentLink({ ...currentLink, label: e.target.value })
              }
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              placeholder="URL"
              value={currentLink.url}
              onChange={(e) =>
                setCurrentLink({ ...currentLink, url: e.target.value })
              }
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-mono"
            />
            <button
              type="button"
              onClick={addLink}
              className="bg-slate-800 text-white px-6 rounded-xl font-bold text-sm"
            >
              + เพิ่ม
            </button>
          </div>

          {links.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {links.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border border-slate-200 p-3 pl-4 rounded-xl shadow-sm"
                >
                  <span className="font-bold text-sm text-slate-700">
                    {l.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* --- Sticky Bottom Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 flex justify-center shadow-2xl">
        <div className="max-w-5xl w-full flex gap-4">
          <Link
            href="/dashboard/news"
            className="px-8 py-3 rounded-full border-2 border-slate-200 font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all text-center min-w-[140px]"
          >
            ยกเลิก
          </Link>
          <button
            onClick={handleUpdate}
            disabled={submitting}
            className={`flex-1 py-3 rounded-full font-bold text-lg shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2
                ${submitting ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-500/50"}`}
          >
            {submitting ? "⏳ กำลังบันทึก..." : "💾 บันทึกการแก้ไข"}
          </button>
        </div>
      </div>
    </div>
  );
}
