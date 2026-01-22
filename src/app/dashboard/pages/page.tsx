"use client";

import { useState, useEffect, useCallback } from "react";
// 1. เรียกใช้ dynamic import สำหรับ Editor (แก้ปัญหา Error ตอนรันบน Server)
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import CSS ของ Editor

// โหลด Editor แบบ Dynamic เพื่อไม่ให้พังใน Next.js
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface PageItem {
  _id: string;
  slug: string;
  title: string;
  content: string;
}

export default function ManagePages() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // เก็บเป็น HTML String
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); // เพิ่มตัวแปรเช็คสถานะแก้ไข

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // ฟังก์ชันเคลียร์ค่า
  const resetForm = () => {
    setSlug("");
    setTitle("");
    setContent("");
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cleanSlug = slug.replace(/^\//, "");

    // ถ้ามี editId ให้ใช้ PUT (แก้ไข) ถ้าไม่มีใช้ POST (เพิ่มใหม่)
    const method = editId ? "PUT" : "POST";
    const bodyData = { _id: editId, slug: cleanSlug, title, content };

    try {
      const res = await fetch("/api/pages", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        alert("บันทึกหน้าเว็บสำเร็จ!");
        fetchPages();
        resetForm();
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (p: PageItem) => {
    setEditId(p._id);
    setSlug(p.slug);
    setTitle(p.title);
    setContent(p.content);
    // เลื่อนหน้าจอขึ้นบนสุด
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-8 text-white min-h-screen bg-black">
      <h1 className="text-2xl font-bold mb-6 text-blue-400 border-b border-zinc-800 pb-4">
        📝 จัดการเนื้อหาหน้าเว็บ (Rich Text Editor)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 h-fit shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              {editId ? "✏️ แก้ไขเนื้อหา" : "➕ เพิ่มหน้าใหม่"}
            </h2>
            {editId && (
              <button
                onClick={resetForm}
                className="text-xs text-red-400 underline"
              >
                ยกเลิกแก้ไข
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  ลิงก์ (Slug)
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="เช่น about"
                  className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  หัวข้อหน้า
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น เกี่ยวกับเรา"
                  className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* --- ส่วน Editor (แทน textarea เดิม) --- */}
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">
                เนื้อหา (จัดรูปแบบ, รูปภาพ, ตาราง)
              </label>
              <div className="text-black">
                {" "}
                {/* SunEditor ใช้ธีมสีขาว ต้องครอบ div สีดำ */}
                <SunEditor
                  setContents={content} // ค่าเริ่มต้น (สำหรับตอนกดแก้ไข)
                  onChange={setContent} // เมื่อพิมพ์ ให้เก็บค่า HTML ลง state
                  height="400px"
                  setOptions={{
                    buttonList: [
                      ["undo", "redo"],
                      ["font", "fontSize", "formatBlock"],
                      [
                        "bold",
                        "underline",
                        "italic",
                        "strike",
                        "subscript",
                        "superscript",
                      ],
                      ["fontColor", "hiliteColor"],
                      ["removeFormat"],
                      ["outdent", "indent"], // เยื้องหน้า
                      ["align", "horizontalRule", "list", "lineHeight"], // จัดตำแหน่ง ซ้าย/กลาง/ขวา
                      ["table", "link", "image", "video"], // ตาราง, ลิงก์, รูปภาพ
                      ["fullScreen", "showBlocks", "codeView"],
                    ],
                    defaultTag: "div",
                    minHeight: "400px",
                    showPathLabel: false,
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${
                editId
                  ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isLoading
                ? "กำลังบันทึก..."
                : editId
                  ? "บันทึกการแก้ไข"
                  : "บันทึกข้อมูล"}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-300">
            รายชื่อหน้าทั้งหมด
          </h2>
          {pages.length > 0 ? (
            pages.map((p) => (
              <div
                key={p._id}
                className={`p-4 border rounded-xl flex justify-between items-center transition-all ${
                  editId === p._id
                    ? "bg-yellow-900/20 border-yellow-600"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <div>
                  <div className="font-bold text-blue-400 text-lg">
                    /{p.slug}
                  </div>
                  <div className="text-zinc-300 font-medium">{p.title}</div>
                </div>
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-zinc-800 hover:bg-yellow-600 hover:text-white text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  แก้ไข
                </button>
              </div>
            ))
          ) : (
            <div className="text-zinc-500 text-center py-10 border-2 border-dashed border-zinc-800 rounded-xl">
              ยังไม่มีข้อมูลหน้าเว็บ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
