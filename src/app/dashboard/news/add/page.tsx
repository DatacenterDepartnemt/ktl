/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

export default function AddNewsPage() {
  const router = useRouter();

  // --- States ---
  // ❌ ลบ Title State ออก
  const [categories, setCategories] = useState<string[]>(["PR"]);
  const [content, setContent] = useState("");

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [newsletterFiles, setNewsletterFiles] = useState<File[]>([]);
  const [newsletterPreviews, setNewsletterPreviews] = useState<string[]>([]);

  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [currentLink, setCurrentLink] = useState({ label: "", url: "" });

  // ✅ State สำหรับ Video Embed
  const [videoEmbeds, setVideoEmbeds] = useState<string[]>([]);
  const [currentEmbed, setCurrentEmbed] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Editor Loader
  const [SunEditorComponent, setSunEditorComponent] =
    useState<React.ComponentType<any> | null>(null);
  useEffect(() => {
    import("suneditor-react").then((mod) =>
      setSunEditorComponent(() => mod.default),
    );
  }, []);

  // --- Helper: สร้าง Title จาก Content ---
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

  // --- Helper: บีบอัดรูป ---
  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  // --- Handlers ---
  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value)
        ? prev.length === 1
          ? prev
          : prev.filter((c) => c !== value)
        : [...prev, value],
    );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressing(true);
      const originalFiles = Array.from(e.target.files);
      const compressedFiles = await Promise.all(
        originalFiles.map((file) => compressImage(file)),
      );
      setImageFiles((prev) => [...prev, ...compressedFiles]);
      setImagePreviews((prev) => [
        ...prev,
        ...compressedFiles.map((f) => URL.createObjectURL(f)),
      ]);
      setIsCompressing(false);
    }
  };
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewsletterChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressing(true);
      const originalFiles = Array.from(e.target.files);
      const compressedFiles = await Promise.all(
        originalFiles.map((file) => compressImage(file)),
      );
      setNewsletterFiles((prev) => [...prev, ...compressedFiles]);
      setNewsletterPreviews((prev) => [
        ...prev,
        ...compressedFiles.map((f) => URL.createObjectURL(f)),
      ]);
      setIsCompressing(false);
    }
  };
  const removeNewsletter = (index: number) => {
    setNewsletterFiles((prev) => prev.filter((_, i) => i !== index));
    setNewsletterPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (!currentLink.label || !currentLink.url)
      return alert("กรุณากรอกข้อมูลลิงก์ให้ครบ");
    setLinks([...links, currentLink]);
    setCurrentLink({ label: "", url: "" });
  };
  const removeLink = (index: number) =>
    setLinks(links.filter((_, i) => i !== index));

  // ✅ Video Handlers
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Generate Title Logic
    const autoTitle = generateTitleFromContent(content);
    if (!autoTitle) {
      alert(
        "กรุณาใส่เนื้อหาข่าวที่เป็นข้อความด้วยครับ (ระบบต้องใช้เพื่อสร้างหัวข้อข่าว)",
      );
      return;
    }

    if (isLoading || isCompressing) return;
    setIsLoading(true);

    try {
      const generalUploads = await Promise.all(
        imageFiles.map((f) => uploadToCloudinary(f, "ktltc_news")),
      );
      const newsletterUploads = await Promise.all(
        newsletterFiles.map((f) => uploadToCloudinary(f, "ktltc_newsletters")),
      );

      const validImages = generalUploads.filter(
        (url) => url !== null,
      ) as string[];
      const validNewsletter = newsletterUploads.filter(
        (url) => url !== null,
      ) as string[];

      const payload = {
        title: autoTitle, // ✅ ใช้ Title อัตโนมัติ
        categories,
        content,
        images: validImages,
        announcementImages: validNewsletter,
        links,
        videoEmbeds, // ✅ ส่งข้อมูลวิดีโอ
      };

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("บันทึกสำเร็จ!");
        router.push("/dashboard/news");
        router.refresh();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error(error);
      alert("เชื่อมต่อ Server ไม่ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-40 text-slate-800 relative dark:bg-black dark:text-slate-200">
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
      <div className="border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/80 dark:bg-black/80 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/news"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all dark:bg-zinc-800 dark:text-slate-400 dark:hover:bg-zinc-700 dark:hover:text-slate-200"
            >
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                สร้างข่าวใหม่
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                กรอกข้อมูลเพื่อประชาสัมพันธ์
              </p>
            </div>
          </div>
          {isCompressing && (
            <span className="text-blue-600 text-xs font-black animate-pulse bg-blue-50 px-3 py-1 rounded-full border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              ⏳ กำลังย่อขนาดรูป...
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* --- Card 1: ข้อมูลหลัก --- */}
        <section className="rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl dark:bg-blue-900/30 dark:text-blue-400">
              📝
            </div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              รายละเอียดข่าว
            </h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 dark:text-slate-500">
                หมวดหมู่
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
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
              <div className="rounded-2xl shadow-sm border border-slate-200 overflow-hidden dark:border-zinc-700">
                {SunEditorComponent ? (
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
                ) : (
                  <div className="h-[400px] flex items-center justify-center bg-slate-50 text-slate-400 dark:bg-zinc-800 dark:text-slate-500">
                    กำลังโหลด Editor...
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- Card 2: รูปภาพทั่วไป --- */}
        <section className="rounded-3xl space-y-6">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg dark:text-slate-200">
            🖼️ รูปภาพทั่วไป (แนวนอน)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {imagePreviews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-700 group"
              >
                <Image src={src} alt="preview" fill className="object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs"
                >
                  ลบรูปนี้
                </button>
              </div>
            ))}
            <label className="aspect-video border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all dark:border-zinc-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-500">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
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
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg dark:text-slate-200">
            📜 จดหมายข่าว (แนวตั้ง)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {newsletterPreviews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 group"
              >
                <Image
                  src={src}
                  alt="newsletter"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={() => removeNewsletter(i)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs"
                >
                  ลบรูปนี้
                </button>
              </div>
            ))}
            <label className="aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all dark:border-zinc-600 dark:hover:bg-purple-900/20 dark:hover:border-purple-500">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleNewsletterChange}
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

        {/* --- Card 4: Links --- */}
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
              onClick={addLink}
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
                  onClick={() => removeLink(i)}
                  className="text-red-400 hover:text-red-600 w-8 h-8 rounded-full hover:bg-red-50 transition-all flex items-center justify-center font-bold dark:hover:bg-red-900/30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --- Card 5: Video Embeds (✅ เพิ่มใหม่ในหน้า Add) --- */}
        <section className="rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl dark:bg-red-900/30 dark:text-red-400">
              🎥
            </div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              วิดีโอ (Embed Code)
            </h2>
          </div>
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
          {videoEmbeds.length > 0 && (
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
          )}
        </section>
      </div>

      {/* --- Action Bar (Bottom) --- */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:bg-zinc-900/90 dark:border-zinc-800">
        <div className="max-w-5xl w-full flex gap-4">
          <Link
            href="/dashboard/news"
            className="px-10 py-4 rounded-full border-2 border-slate-200 font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all text-center min-w-35 dark:border-zinc-700 dark:text-slate-500 dark:hover:bg-zinc-800 dark:hover:text-slate-300"
          >
            ยกเลิก
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isCompressing}
            className={`flex-1 py-4 rounded-full font-bold text-white shadow-xl shadow-blue-500/20 transition-all ${isLoading || isCompressing ? "bg-slate-300 cursor-not-allowed dark:bg-zinc-700" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-100 hover:shadow-blue-500/40 dark:shadow-none"}`}
          >
            {isLoading ? "⏳ กำลังบันทึก..." : "✨ บันทึกข่าวสาร"}
          </button>
        </div>
      </div>
    </div>
  );
}
