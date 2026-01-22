"use client";

import { useState, useEffect, useCallback } from "react";
import { INavItem } from "@/types/nav";

export default function ManageNavbar() {
  const [navItems, setNavItems] = useState<INavItem[]>([]);

  // Form States
  const [label, setLabel] = useState("");
  const [path, setPath] = useState("/");
  const [order, setOrder] = useState(0);
  const [parentId, setParentId] = useState("");

  // Edit State (เก็บ ID ของตัวที่กำลังแก้ ถ้าไม่มีแปลว่ากำลังเพิ่มใหม่)
  const [editId, setEditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNav = useCallback(async () => {
    try {
      const res = await fetch("/api/navbar");
      if (res.ok) {
        const data = await res.json();
        setNavItems(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchNav();
  }, [fetchNav]);

  // ฟังก์ชันเคลียร์ฟอร์ม
  const resetForm = () => {
    setLabel("");
    setPath("/");
    setOrder(0);
    setParentId("");
    setEditId(null); // ออกจากโหมดแก้ไข
  };

  // ฟังก์ชันเมื่อกดปุ่ม "แก้ไข" (สีเหลือง)
  const handleEdit = (item: INavItem) => {
    setEditId(item._id);
    setLabel(item.label);
    setPath(item.path);
    setOrder(item.order);
    setParentId(item.parentId || "");

    // เลื่อนหน้าจอขึ้นไปที่ฟอร์ม
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // ถ้ามี editId ให้ใช้ PUT (แก้ไข), ถ้าไม่มีให้ใช้ POST (เพิ่มใหม่)
    const method = editId ? "PUT" : "POST";
    const bodyData = {
      _id: editId, // ส่ง ID ไปด้วยถ้าเป็นการแก้ไข
      label,
      path,
      order: Number(order),
      parentId: parentId === "" ? null : parentId,
    };

    try {
      const res = await fetch("/api/navbar", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        alert(editId ? "แก้ไขเมนูสำเร็จ!" : "บันทึกเมนูสำเร็จ!");
        resetForm();
        fetchNav();
      }
    } catch {
      alert("Error saving data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("ยืนยันลบเมนู?")) {
      const res = await fetch(`/api/navbar/${id}`, { method: "DELETE" });
      if (res.ok) {
        // ถ้าลบตัวที่กำลังแก้อยู่ ให้เคลียร์ฟอร์มด้วย
        if (editId === id) resetForm();
        fetchNav();
      }
    }
  };

  const parentOptions = navItems.filter((item) => !item.parentId);

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-8 text-blue-400 border-b border-zinc-800 pb-4">
        ⚙️ จัดการเมนู (รองรับเมนูย่อย)
      </h1>

      <section className="mb-12 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <h2 className="text-lg font-bold mb-4 text-zinc-300">
          {editId ? "✏️ แก้ไขเมนู" : "➕ เพิ่มเมนูใหม่"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">ชื่อเมนู</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="bg-black p-3 border border-zinc-700 rounded-lg text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">ลิงก์ (Path)</label>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="bg-black p-3 border border-zinc-700 rounded-lg text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">ลำดับ</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="bg-black p-3 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">
                เป็นเมนูย่อยของ (Parent)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="bg-black p-3 border border-zinc-700 rounded-lg text-white"
                disabled={
                  !!editId && navItems.some((i) => i.parentId === editId)
                } // ห้ามแก้ Parent ถ้าตัวเองมีลูกอยู่ (ป้องกัน Loop)
              >
                <option value="">-- เป็นเมนูหลัก --</option>
                {parentOptions.map(
                  (p) =>
                    // ไม่แสดงตัวเองในตัวเลือก (ป้องกันเลือกตัวเองเป็นพ่อ)
                    p._id !== editId && (
                      <option key={p._id} value={p._id}>
                        {p.label}
                      </option>
                    ),
                )}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            {/* ปุ่มบันทึก */}
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                editId
                  ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isLoading
                ? "กำลังประมวลผล..."
                : editId
                  ? "บันทึกการแก้ไข"
                  : "เพิ่มเมนู"}
            </button>

            {/* ปุ่มยกเลิก (แสดงเฉพาะตอนแก้ไข) */}
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-bold bg-zinc-700 hover:bg-zinc-600 text-white transition"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">โครงสร้างเมนู</h2>
        {parentOptions.map((parent) => (
          <div
            key={parent._id}
            className={`border rounded-xl p-4 transition-colors ${
              editId === parent._id
                ? "bg-yellow-900/20 border-yellow-600"
                : "bg-zinc-900/50 border-zinc-800"
            }`}
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
              <span className="font-bold text-blue-400">
                {parent.label}{" "}
                <span className="text-xs text-zinc-500">({parent.path})</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(parent)}
                  className="text-yellow-500 text-xs hover:underline px-2"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(parent._id)}
                  className="text-red-500 text-xs hover:underline"
                >
                  ลบแม่
                </button>
              </div>
            </div>

            <div className="pl-6 space-y-2">
              {navItems
                .filter((c) => c.parentId === parent._id)
                .map((child) => (
                  <div
                    key={child._id}
                    className={`flex justify-between items-center text-sm p-1 rounded ${
                      editId === child._id
                        ? "bg-yellow-500/10 text-yellow-200"
                        : "text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    <span>
                      ↳ {child.label} ({child.path})
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(child)}
                        className="text-yellow-600 hover:text-yellow-400 text-xs"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(child._id)}
                        className="text-red-800 hover:text-red-500 text-xs"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
