import clientPromise from "@/lib/db";
import { NavItem } from "@/types/nav";
import { cookies } from "next/headers";
import NavbarClient from "./NavbarClient";
import { jwtVerify } from "jose"; // Library สำหรับจัดการ JWT บน Server/Edge

// กำหนด Type ของเมนู โดยเพิ่ม field children สำหรับเก็บเมนูย่อย
export type MenuItem = NavItem & {
  children?: MenuItem[];
};

// --- ฟังก์ชัน 1: ดึงและจัดโครงสร้างเมนู ---
async function getNavItems() {
  try {
    // เชื่อมต่อ Database
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงข้อมูล Navbar ทั้งหมด เรียงตามลำดับ (order)
    const items = await db
      .collection("navbar")
      .find({})
      .sort({ order: 1 })
      .toArray();

    // แปลงข้อมูลจาก MongoDB Object เป็น JSON ปกติ
    const allItems = JSON.parse(JSON.stringify(items)) as NavItem[];

    // --- Logic จัดกลุ่มเมนู (Flat Data -> Tree Structure) ---
    // 1. หาตัวแม่ (Parent) คือตัวที่ไม่มี parentId
    const parents = allItems.filter((item) => !item.parentId);

    // 2. วนลูปตัวแม่ เพื่อหาลูกๆ (Children) ของมัน
    const menuTree = parents.map((parent) => {
      const children = allItems.filter(
        (child) => child.parentId === parent._id,
      );
      // คืนค่ากลับไปพร้อมลูกๆ
      return { ...parent, children };
    }) as MenuItem[];

    return menuTree;
  } catch (error) {
    console.error("Failed to fetch nav items:", error);
    return []; // ถ้ามี Error ให้ส่ง Array ว่างกลับไป เมนูจะไม่พังแต่แค่ไม่แสดง
  }
}

// --- Main Component (Server Component) ---
export default async function Navbar() {
  // 1. เรียกฟังก์ชันดึงข้อมูลเมนู (ทำงานฝั่ง Server)
  const menuTree = await getNavItems();

  // 2. ดึง Cookie และตรวจสอบ Token (Authentication)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // เตรียมตัวแปรไว้เก็บข้อมูลผู้ใช้ (ถ้าไม่มี Token ก็จะเป็น undefined)
  let username: string | undefined = undefined;
  let role: string | undefined = undefined;

  if (token) {
    try {
      // เตรียม Secret Key สำหรับไขรหัส Token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "default_secret_key_change_me",
      );

      // ใช้ Library 'jose' แกะ Token (Verify & Decode)
      // ถ้า Token หมดอายุหรือถูกปลอมแปลง บรรทัดนี้จะ Error และข้ามไป catch
      const { payload } = await jwtVerify(token, secret);

      // ดึงข้อมูล Username และ Role ออกมาจาก Payload
      if (payload.username) username = payload.username as string;
      if (payload.role) role = payload.role as string;
    } catch (error) {
      console.error("Token verification failed:", error);
      // กรณี Token ไม่ถูกต้อง (เช่น หมดอายุ) ค่า username/role จะเป็น undefined
      // ทำให้ NavbarClient แสดงผลเหมือนผู้ใช้ทั่วไป (Guest)
    }
  }

  // 3. Render: ส่งข้อมูลที่ประมวลผลเสร็จแล้วไปให้ Client Component แสดงผล
  return <NavbarClient menuTree={menuTree} username={username} role={role} />;
}
