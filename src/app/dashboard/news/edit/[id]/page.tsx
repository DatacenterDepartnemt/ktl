/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { uploadToCloudinary } from "@/lib/upload";
import imageCompression from "browser-image-compression";
import "suneditor/dist/css/suneditor.min.css";

// --- Config ---
const CATEGORIES = [
  {
    value: "PR",
    label: "ข่าวประชาสัมพันธ์",
    color:
      "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  {
    value: "Newsletter",
    label: "จดหมายข่าว",
    color:
      "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  {
    value: "Internship",
    label: "ฝึกงาน/ประสบการณ์",
    color:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    value: "Announcement",
    label: "ข่าวประกาศ",
    color:
      "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  },
  {
    value: "Bidding",
    label: "ประกวดราคา",
    color:
      "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
  },
  {
    value: "Order",
    label: "คำสั่งวิทยาลัย",
    color:
      "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  },
];

const fontList = [
  "Sarabun",
  "Kanit",
  "Prompt",
  "Mitr",
  "Roboto",
  "Arial",
  "Tahoma",
];

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [SunEditorComponent, setSunEditorComponent] =
    useState<React.ComponentType<any> | null>(null);

  // ข้อมูลข่าว
  // ❌ ลบ Title State ออก (เพราะเราสร้างอัตโนมัติ)
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // --- รูปภาพเดิม (URLs) ---
  const [images, setImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [newsletterImages, setNewsletterImages] = useState<string[]>([]);
  const [selectedNewsletters, setSelectedNewsletters] = useState<number[]>([]);

  // --- รูปภาพใหม่ (Files) ---
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilesPreview, setNewFilesPreview] = useState<string[]>([]);
  const [newNewsletterFiles, setNewNewsletterFiles] = useState<File[]>([]);
  const [newNewsletterPreview, setNewNewsletterPreview] = useState<string[]>(
    [],
  );

  // --- Links ---
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [currentLink, setCurrentLink] = useState({ label: "", url: "" });

  // --- Video Embeds (✅ เพิ่มใหม่) ---
  const [videoEmbeds, setVideoEmbeds] = useState<string[]>([]);
  const [currentEmbed, setCurrentEmbed] = useState("");

  // --- Fetch Data ---
  useEffect(() => {
    import("suneditor-react").then((mod) =>
      setSunEditorComponent(() => mod.default),
    );

    fetch(`/api/news/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content);
        setCategories(
          Array.isArray(data.categories)
            ? data.categories
            : [data.category || "PR"],
        );
        setImages(data.images || []);
        setNewsletterImages(data.announcementImages || []);
        setLinks(data.links || []);
        setVideoEmbeds(data.videoEmbeds || []); // ✅ ดึงวิดีโอเดิม
        setLoading(false);
      });
  }, [id]);

  // --- Helpers ---
  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  // ✅ ฟังก์ชันสร้าง Title จาก Content
  const generateTitleFromContent = (htmlContent: string) => {
    if (typeof window === "undefined") return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const text = doc.body.textContent || "";
    const cleanText = text.replace(/\s+/g, " ").trim();
    if (!cleanText) return "";
    const limit = 100;
    return cleanText.length > limit
      ? cleanText.substring(0, limit) + "..."
      : cleanText;
  };

  // --- Logic: เลือก/ลบ รูป ---
  const toggleSelectAllImages = () =>
    selectedImages.length === images.length
      ? setSelectedImages([])
      : setSelectedImages(images.map((_, i) => i));
  const toggleSelectImage = (idx: number) =>
    setSelectedImages((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  const deleteSelectedImages = () => {
    setImages((prev) => prev.filter((_, i) => !selectedImages.includes(i)));
    setSelectedImages([]);
  };

  const toggleSelectAllNewsletters = () =>
    selectedNewsletters.length === newsletterImages.length
      ? setSelectedNewsletters([])
      : setSelectedNewsletters(newsletterImages.map((_, i) => i));
  const toggleSelectNewsletter = (idx: number) =>
    setSelectedNewsletters((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  const deleteSelectedNewsletters = () => {
    setNewsletterImages((prev) =>
      prev.filter((_, i) => !selectedNewsletters.includes(i)),
    );
    setSelectedNewsletters([]);
  };

  // --- Logic: รูปใหม่ ---
  const handleNewFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files) {
      setIsCompressing(true);
      const files = Array.from(e.target.files);
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      setNewFiles((prev) => [...prev, ...compressed]);
      setNewFilesPreview((prev) => [
        ...prev,
        ...compressed.map((f) => URL.createObjectURL(f)),
      ]);
      setIsCompressing(false);
    }
  };

  const handleNewNewsletterChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files) {
      setIsCompressing(true);
      const files = Array.from(e.target.files);
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      setNewNewsletterFiles((prev) => [...prev, ...compressed]);
      setNewNewsletterPreview((prev) => [
        ...prev,
        ...compressed.map((f) => URL.createObjectURL(f)),
      ]);
      setIsCompressing(false);
    }
  };

  // --- Logic: Video Embed ---
  const addEmbed = () => {
    if (!currentEmbed.trim()) return;
    if (!currentEmbed.includes("<iframe")) {
      alert("กรุณาวางโค้ด Embed ที่ถูกต้อง (ต้องมี <iframe...)");
      return;
    }
    setVideoEmbeds([...videoEmbeds, currentEmbed]);
    setCurrentEmbed("");
  };
  const removeEmbed = (index: number) =>
    setVideoEmbeds(videoEmbeds.filter((_, i) => i !== index));

  // --- Submit Logic ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. สร้าง Title อัตโนมัติ
    const autoTitle = generateTitleFromContent(content);
    if (!autoTitle) {
      alert("กรุณาใส่เนื้อหาข่าว (เพื่อใช้สร้างหัวข้ออัตโนมัติ)");
      return;
    }

    if (submitting || isCompressing) return;
    setSubmitting(true);

    try {
      const uploadedNewsUrls = await Promise.all(
        newFiles.map((f) => uploadToCloudinary(f, "ktltc_news")),
      );
      const uploadedNewsletterUrls = await Promise.all(
        newNewsletterFiles.map((f) =>
          uploadToCloudinary(f, "ktltc_newsletters"),
        ),
      );

      const finalImages = [
        ...images,
        ...uploadedNewsUrls.filter((url) => url !== null),
      ];
      const finalNewsletters = [
        ...newsletterImages,
        ...uploadedNewsletterUrls.filter((url) => url !== null),
      ];

      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: autoTitle, // ✅ ส่ง Title ที่สร้างเอง
          content,
          categories,
          images: finalImages,
          announcementImages: finalNewsletters,
          links,
          videoEmbeds, // ✅ ส่งวิดีโอ
        }),
      });

      if (res.ok) {
        alert("✅ แก้ไขข้อมูลเรียบร้อย");
        router.push("/dashboard/news");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold dark:bg-black dark:text-slate-500">
        กำลังโหลด...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-40 text-slate-800 antialiased dark:bg-black dark:text-slate-200">
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
      <div className="border-b border-slate-200 sticky top-0 z-30 px-4 py-4 flex items-center justify-between backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/news"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all dark:bg-zinc-800 dark:text-slate-400 dark:hover:bg-zinc-700"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold dark:text-white">แก้ไขข่าวสาร</h1>
        </div>
        {isCompressing && (
          <span className="text-blue-600 text-xs font-black animate-pulse bg-blue-50 px-3 py-1 rounded-full border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
            ⏳ กำลังย่อขนาดรูป...
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* --- Card 1: ข้อมูลหลัก (ไม่มี Title Input) --- */}
        <section className="rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl text-amber-600 flex items-center justify-center text-xl dark:bg-amber-900/30 dark:text-amber-400">
              📝
            </div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              รายละเอียดข่าว
            </h2>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 dark:text-slate-500">
              หมวดหมู่
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  onClick={() =>
                    setCategories((prev) =>
                      prev.includes(cat.value)
                        ? prev.filter((c) => c !== cat.value)
                        : [...prev, cat.value],
                    )
                  }
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center font-bold text-sm ${categories.includes(cat.value) ? cat.color : "border-slate-100 text-slate-400 hover:border-slate-200 dark:border-zinc-700 dark:text-slate-500 dark:hover:border-zinc-600"}`}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 dark:text-slate-500">
              เนื้อหาข่าว (Rich Text)
            </label>
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm dark:border-zinc-700">
              {SunEditorComponent && (
                <div className="sun-editor-dark-mode-override">
                  <SunEditorComponent
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
                        ["table", "link", "image", "video"],
                        ["fullScreen", "codeView"],
                      ],
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- Card 2: รูปภาพทั่วไป --- */}
        <section className="rounded-3xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg dark:text-slate-200">
              🖼️ รูปภาพทั่วไป (แนวนอน)
            </h2>
            <div className="flex gap-2 w-full md:w-auto">
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAllImages}
                  className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800"
                >
                  {selectedImages.length === images.length
                    ? "✕ ยกเลิก"
                    : "✓ เลือกทั้งหมด"}
                </button>
              )}
              {selectedImages.length > 0 && (
                <button
                  type="button"
                  onClick={deleteSelectedImages}
                  className="flex-1 md:flex-none bg-red-500 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-200 animate-pulse dark:shadow-none dark:bg-red-600"
                >
                  ลบที่เลือก ({selectedImages.length})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div
                key={`old-img-${idx}`}
                onClick={() => toggleSelectImage(idx)}
                className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${selectedImages.includes(idx) ? "border-red-500 scale-90" : "border-slate-100 shadow-sm hover:border-blue-200 dark:border-zinc-700 dark:hover:border-blue-500"}`}
              >
                <Image src={img} alt="old" fill className="object-cover" />
                {selectedImages.includes(idx) && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center text-white font-black text-2xl drop-shadow-md">
                    ✓
                  </div>
                )}
              </div>
            ))}
            {newFilesPreview.map((src, idx) => (
              <div
                key={`new-img-${idx}`}
                className="relative aspect-video rounded-xl overflow-hidden border-4 border-blue-400 shadow-md group dark:border-blue-600"
              >
                <Image src={src} alt="new" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setNewFiles(newFiles.filter((_, i) => i !== idx));
                    setNewFilesPreview(
                      newFilesPreview.filter((_, i) => i !== idx),
                    );
                  }}
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                >
                  ยกเลิก
                </button>
                <div className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                  New
                </div>
              </div>
            ))}
            <label className="aspect-video border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all dark:border-zinc-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-500">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleNewFilesChange}
              />
              <span className="text-xl text-slate-400 dark:text-slate-500">
                +
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase dark:text-slate-500">
                Add More
              </span>
            </label>
          </div>
        </section>

        {/* --- Card 3: จดหมายข่าว --- */}
        <section className="rounded-3xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg dark:text-slate-200">
              📜 จดหมายข่าว (แนวตั้ง)
            </h2>
            <div className="flex gap-2 w-full md:w-auto">
              {newsletterImages.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAllNewsletters}
                  className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800"
                >
                  {selectedNewsletters.length === newsletterImages.length
                    ? "✕ ยกเลิก"
                    : "✓ เลือกทั้งหมด"}
                </button>
              )}
              {selectedNewsletters.length > 0 && (
                <button
                  type="button"
                  onClick={deleteSelectedNewsletters}
                  className="flex-1 md:flex-none bg-red-500 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-200 animate-pulse dark:shadow-none dark:bg-red-600"
                >
                  ลบที่เลือก ({selectedNewsletters.length})
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {newsletterImages.map((img, idx) => (
              <div
                key={`old-nl-${idx}`}
                onClick={() => toggleSelectNewsletter(idx)}
                className={`relative aspect-3/4 rounded-xl overflow-hidden cursor-pointer border-4 bg-slate-50 transition-all ${selectedNewsletters.includes(idx) ? "border-red-500 scale-90" : "border-slate-100 shadow-sm hover:border-purple-200 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-purple-500"}`}
              >
                <Image src={img} alt="old-nl" fill className="object-contain" />
                {selectedNewsletters.includes(idx) && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center text-white font-black text-2xl drop-shadow-md">
                    ✓
                  </div>
                )}
              </div>
            ))}
            {newNewsletterPreview.map((src, idx) => (
              <div
                key={`new-nl-${idx}`}
                className="relative aspect-3/4 rounded-xl overflow-hidden border-4 border-purple-400 shadow-md bg-slate-50 group dark:bg-zinc-800 dark:border-purple-600"
              >
                <Image src={src} alt="new-nl" fill className="object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setNewNewsletterFiles(
                      newNewsletterFiles.filter((_, i) => i !== idx),
                    );
                    setNewNewsletterPreview(
                      newNewsletterPreview.filter((_, i) => i !== idx),
                    );
                  }}
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                >
                  ยกเลิก
                </button>
                <div className="absolute top-1 left-1 bg-purple-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                  New
                </div>
              </div>
            ))}
            <label className="aspect-3/4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all dark:border-zinc-600 dark:hover:bg-purple-900/20 dark:hover:border-purple-500">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleNewNewsletterChange}
              />
              <span className="text-xl text-slate-400 dark:text-slate-500">
                +
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase dark:text-slate-500">
                Add More
              </span>
            </label>
          </div>
        </section>

        {/* --- Card 4: ลิงก์ --- */}
        <section className="rounded-3xl space-y-6">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg dark:text-slate-200">
            🔗 ลิงก์ภายนอก / เอกสารแนบ
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              placeholder="ชื่อปุ่ม (เช่น ดาวน์โหลด PDF)"
              value={currentLink.label}
              onChange={(e) =>
                setCurrentLink({ ...currentLink, label: e.target.value })
              }
              className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none border border-slate-200 focus:border-indigo-500 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
            />
            <input
              placeholder="URL ลิงก์"
              value={currentLink.url}
              onChange={(e) =>
                setCurrentLink({ ...currentLink, url: e.target.value })
              }
              className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none border border-slate-200 focus:border-indigo-500 transition-all font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
            />
            <button
              type="button"
              onClick={() => {
                if (currentLink.label && currentLink.url) {
                  setLinks([...links, currentLink]);
                  setCurrentLink({ label: "", url: "" });
                }
              }}
              className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:shadow-none"
            >
              + เพิ่มลิงก์
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {links.map((l, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-indigo-500"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-slate-700 truncate dark:text-slate-200">
                    {l.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate dark:text-slate-500">
                    {l.url}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600 w-8 h-8 rounded-full hover:bg-red-50 transition-all flex items-center justify-center font-bold dark:hover:bg-red-900/30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --- Card 5: Video Embeds (✅ เพิ่มใหม่) --- */}
        <section className="rounded-3xl space-y-6">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg dark:text-slate-200">
            🎥 วิดีโอ (Embed Code)
          </h2>
          <div className="flex flex-col gap-3">
            <textarea
              rows={3}
              placeholder='วางโค้ด Embed ที่นี่... เช่น <iframe src="..." ></iframe>'
              value={currentEmbed}
              onChange={(e) => setCurrentEmbed(e.target.value)}
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-200 focus:border-red-500 transition-all font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
            />
            <button
              type="button"
              onClick={addEmbed}
              className="self-end bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
            >
              + เพิ่มวิดีโอ
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {videoEmbeds.map((code, i) => (
              <div
                key={i}
                className="relative group border border-slate-200 rounded-xl p-2 bg-white dark:bg-zinc-800 dark:border-zinc-700"
              >
                <button
                  type="button"
                  onClick={() => removeEmbed(i)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-20 hover:scale-110 transition-transform"
                >
                  ✕
                </button>
                <div
                  className="aspect-video w-full overflow-hidden rounded-lg bg-black/5 [&>iframe]:w-full [&>iframe]:h-full"
                  dangerouslySetInnerHTML={{ __html: code }}
                />
                <div className="mt-2 text-[10px] text-slate-400 font-mono truncate px-2">
                  {code}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* --- Floating Bottom Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:bg-zinc-900/90 dark:border-zinc-800">
        <div className="max-w-5xl w-full flex gap-4">
          <Link
            href="/dashboard/news"
            className="px-10 py-4 rounded-full border-2 border-slate-200 font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all text-center min-w-35 dark:border-zinc-700 dark:text-slate-500 dark:hover:bg-zinc-800 dark:hover:text-slate-300"
          >
            ยกเลิก
          </Link>
          <button
            onClick={handleUpdate}
            disabled={submitting || isCompressing}
            className={`flex-1 py-4 rounded-full font-bold text-white shadow-xl shadow-amber-500/20 transition-all ${submitting || isCompressing ? "bg-slate-300 cursor-not-allowed dark:bg-zinc-700" : "bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-[1.02] active:scale-100 hover:shadow-amber-500/40 dark:shadow-none"}`}
          >
            {submitting
              ? "⏳ กำลังบันทึกข้อมูลล่าสุด..."
              : "💾 บันทึกการแก้ไขข่าวสาร"}
          </button>
        </div>
      </div>
    </div>
  );
}
