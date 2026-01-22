"use client";

import { useRouter } from "next/navigation";

export default function LogoutBtn() {
  const router = useRouter();

  const handleLogout = async () => {
    // ถามยืนยันก่อน
    if (!confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) return;

    try {
      // เรียก API เพื่อลบ Cookie ฝั่ง Server
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        // ถ้าลบสำเร็จ ให้รีเฟรชหน้าจอเพื่อให้ Navbar อัปเดตสถานะ
        router.refresh();
        // แล้วดีดกลับไปหน้าแรก
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-xl transition-all font-bold border border-red-500/20 active:scale-95"
    >
      <span className="text-lg">🚪</span>
      <span>ออกจากระบบ</span>
    </button>
  );
}
