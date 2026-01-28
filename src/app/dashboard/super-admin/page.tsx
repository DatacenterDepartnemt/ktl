"use client";

import { useState, useEffect } from "react";

// Interface สำหรับข้อมูลผู้ใช้
interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  phone?: string;
  lineId?: string;
  orderIndex?: number;
}

export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // --- State สำหรับ Modal แก้ไข ---
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    lineId: "",
    password: "", // รหัสผ่าน (Optional)
  });

  // 1. ดึงข้อมูลผู้ใช้
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. ฟังก์ชันจัดลำดับ (เลื่อนขึ้น/ลง และบันทึก)
  const moveUser = async (index: number, direction: "up" | "down") => {
    const newUsers = [...users];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // เช็คขอบเขต
    if (targetIndex < 0 || targetIndex >= newUsers.length) return;

    // สลับตำแหน่งในหน้าจอทันที (Optimistic UI)
    [newUsers[index], newUsers[targetIndex]] = [
      newUsers[targetIndex],
      newUsers[index],
    ];
    setUsers(newUsers);

    // ส่งลำดับใหม่ไปบันทึกที่ API
    try {
      await fetch("/api/users/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: newUsers }),
      });
    } catch (error) {
      console.error("Failed to save order");
      alert("บันทึกลำดับไม่สำเร็จ");
      fetchUsers(); // โหลดข้อมูลเดิมกลับมาถ้าพัง
    }
  };

  // 3. เปลี่ยนสถานะ (อนุมัติ / ระงับ)
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u)),
    );
    try {
      await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
      fetchUsers();
    }
  };

  // 4. เปลี่ยน Role
  const changeRole = async (id: string, newRole: string) => {
    if (!confirm(`ยืนยันการเปลี่ยนสิทธิ์เป็น "${newRole}"?`)) {
      fetchUsers();
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)),
    );
    try {
      await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
    } catch (error) {
      alert("เปลี่ยนสิทธิ์ไม่สำเร็จ");
      fetchUsers();
    }
  };

  // 5. ลบผู้ใช้
  const deleteUser = async (id: string) => {
    if (!confirm("⚠️ คำเตือน: คุณต้องการลบผู้ใช้นี้ถาวรใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch (error) {
      alert("ลบไม่สำเร็จ");
    }
  };

  // 6. เปิด Modal แก้ไข
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      lineId: user.lineId || "",
      password: "",
    });
    setIsModalOpen(true);
  };

  // 7. บันทึกการแก้ไข (จาก Modal)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        alert("✅ แก้ไขข้อมูลสำเร็จ");
        setIsModalOpen(false);
        fetchUsers(); // โหลดข้อมูลใหม่
      } else {
        alert("❌ แก้ไขไม่สำเร็จ");
      }
    } catch (error) {
      alert("❌ เกิดข้อผิดพลาด");
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-slate-400">กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 relative">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <span className="bg-yellow-100 text-yellow-600 p-2 rounded-xl text-2xl">
            ⚡
          </span>
          Super Admin Console
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm ml-14">
          จัดการสิทธิ์ แก้ไขข้อมูล และอนุมัติบัญชีผู้ใช้งาน
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-5 text-center w-16">ลำดับ</th>
                <th className="p-5">ผู้ใช้งาน (User Info)</th>
                <th className="p-5">สิทธิ์ (Role)</th>
                <th className="p-5 text-center">สถานะ</th>
                <th className="p-5 text-right w-32">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  className="group hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Column 1: ปุ่มเลื่อนลำดับ */}
                  <td className="p-5 text-center align-middle">
                    <div className="flex flex-col gap-1 items-center opacity-30 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveUser(index, "up")}
                        disabled={index === 0}
                        className="hover:text-blue-500 disabled:opacity-0 cursor-pointer text-xs font-bold"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveUser(index, "down")}
                        disabled={index === users.length - 1}
                        className="hover:text-blue-500 disabled:opacity-0 cursor-pointer text-xs font-bold"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  {/* Column 2: ข้อมูลผู้ใช้ */}
                  <td className="p-5 align-top">
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white text-base">
                          {user.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono ml-2">
                          (@{user.username})
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs">
                        <div className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          📧 {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            📞 {user.phone}
                          </div>
                        )}
                        {user.lineId && (
                          <div className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            💬 {user.lineId}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Role Dropdown */}
                  <td className="p-5 align-top">
                    <div className="relative inline-block w-full min-w-[120px]">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user._id, e.target.value)}
                        className={`w-full appearance-none px-3 py-1.5 rounded-lg text-sm font-bold border outline-none cursor-pointer transition-all ${
                          user.role === "super_admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                            : user.role === "admin"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                              : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700"
                        }`}
                      >
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-xs">
                        ▼
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Status Toggle */}
                  <td className="p-5 text-center align-top">
                    <button
                      onClick={() => toggleStatus(user._id, user.isActive)}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        user.isActive
                          ? "bg-green-500"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                          user.isActive ? "left-5" : "left-1"
                        }`}
                      />
                    </button>
                    <div
                      className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${
                        user.isActive
                          ? "text-green-600 dark:text-green-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {user.isActive ? "อนุมัติ" : "ไม่อนุมัติ"}
                    </div>
                  </td>

                  {/* Column 5: Actions */}
                  <td className="p-5 text-right align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40 rounded-lg transition-colors"
                        title="แก้ไขข้อมูล"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                        title="ลบผู้ใช้"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟢 Modal แก้ไขข้อมูล */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                📝 แก้ไขข้อมูลผู้ใช้
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        username: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    เบอร์โทร
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Line ID
                  </label>
                  <input
                    type="text"
                    value={editFormData.lineId}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lineId: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>

                <div className="col-span-2 pt-2 border-t border-dashed border-zinc-200 mt-2">
                  <label className="text-xs font-bold text-red-500 uppercase">
                    เปลี่ยนรหัสผ่าน (เว้นว่างไว้ถ้าไม่เปลี่ยน)
                  </label>
                  <input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        password: e.target.value,
                      })
                    }
                    placeholder="ตั้งรหัสผ่านใหม่..."
                    className="w-full p-2 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-900/30"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
