import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import clientPromise from "@/lib/db";
import VisitorTracker from "./VisitorTracker"; // ✅ Import Client Component เพื่อนับคนเข้าเว็บ
import Image from "next/image";

interface NavItem {
  _id: string;
  label: string;
  path: string;
  order: number;
  parentId: string | null;
}

// 1. ฟังก์ชันดึงเมนู Footer จากฐานข้อมูล (Server-side)
async function getFooterNavItems() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const items = await db
      .collection("navbar")
      .find({})
      .sort({ order: 1 })
      .toArray();
    return JSON.parse(JSON.stringify(items)) as NavItem[];
  } catch (error) {
    console.error("Error fetching footer nav:", error);
    return [];
  }
}

// 2. ฟังก์ชันดึงยอดผู้เข้าชมล่าสุดมาแสดง (Read-only)
// หมายเหตุ: การ "เพิ่มค่า" (Increment) จะทำใน VisitorTracker.tsx ฝั่ง Client แทน
async function getVisitorCount() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงค่าจาก collection 'site_stats' document ที่มี _id='visitor_count'
    const result = await db
      .collection("site_stats")
      .findOne({ _id: "visitor_count" as any });

    return result?.count || 1; // ถ้าไม่มีข้อมูล ให้เริ่มที่ 1
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    return 134001; // ค่า Default กรณี Error
  }
}

// --- Main Footer Component ---
export default async function Footer() {
  // Parallel Fetching: ดึงเมนูและยอดวิวพร้อมกันเพื่อความเร็ว
  const navItems = await getFooterNavItems();
  const visitorCount = await getVisitorCount();

  // แปลงตัวเลขยอดวิวเป็น Array เพื่อนำไปวนลูปสร้างกล่องตัวเลข (เช่น 123 -> ['0','0','0','1','2','3'])
  const countDigits = visitorCount.toString().padStart(6, "0").split("");

  // Logic จัดกลุ่มเมนู (Parent/Child)
  const parents = navItems.filter((item) => !item.parentId);
  const getChildren = (parentId: string) =>
    navItems.filter((item) => item.parentId === parentId);

  return (
    <footer className="bg-linear-to-b from-[#0f172a] to-[#020617] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      {/* ✅ VisitorTracker: ทำงานเงียบๆ เบื้องหลัง เพื่อนับจำนวนคน (ไม่แสดงผลอะไรออกมา) */}
      <VisitorTracker />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Grid Layout แบ่งคอลัมน์ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: โลโก้และข้อมูลติดต่อ */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-sm">
                <Image
                  src="/images/favicon.ico"
                  alt="KTL Logo"
                  width={48}
                  height={48}
                />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight text-white">
                  KTL-TC
                </h2>
                <p className="text-[10px] text-slate-400">
                  KANTHARALAK TECHNICAL COLLEGE
                </p>
              </div>
            </div>

            <div className="text-slate-400 text-sm leading-relaxed">
              <p>ช่องทางการติดต่อวิทยาลัยเทคนิคกันทรลักษ์</p>
            </div>

            <div className="flex gap-4">
              <SocialIcon icon={<FaFacebookF />} />
              <SocialIcon icon={<FaTwitter />} />
              <SocialIcon icon={<FaInstagram />} />
              <SocialIcon icon={<FaLinkedinIn />} />
            </div>
          </div>

          {/* Columns 2-5: เมนูลิงก์ต่างๆ (วนลูปสร้าง) */}
          {parents.length > 0 ? (
            parents.map((parent) => (
              <div key={parent._id}>
                <h3 className="font-bold text-base mb-6 border-l-2 border-blue-700 pl-3 text-white">
                  {/* ถ้าหัวข้อมีลิงก์ ให้คลิกได้ */}
                  {parent.path && parent.path !== "#" ? (
                    <Link
                      href={parent.path}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {parent.label}
                    </Link>
                  ) : (
                    parent.label
                  )}
                </h3>

                <ul className="space-y-3 text-sm text-slate-400">
                  {getChildren(parent._id).map((child) => (
                    <FooterLink key={child._id} href={child.path}>
                      {child.label}
                    </FooterLink>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="col-span-4 flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl p-8">
              ยังไม่มีข้อมูลเมนูในระบบ
            </div>
          )}
        </div>

        {/* --- ส่วนแสดงยอดผู้เข้าชม (Digital Counter Style) --- */}
        <div className="flex flex-col items-center justify-center mb-8 gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            จำนวนผู้เข้าชมเว็บไซต์ (Visitors)
          </span>

          <div className="flex gap-1 p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
            {countDigits.map((digit: string, index: number) => (
              <div
                key={index}
                className="relative w-8 h-12 md:w-10 md:h-14 bg-gradient-to-b from-[#222] to-[#111] rounded border border-slate-700 flex items-center justify-center overflow-hidden shadow-lg"
              >
                {/* เส้นขีดกลางให้ดูเหมือนนาฬิกาดิจิทัลเก่า */}
                <div className="absolute top-1/2 w-full h-px bg-black/50 z-10 shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                <span className="text-2xl md:text-3xl font-mono font-bold text-slate-200 z-0">
                  {digit}
                </span>
                {/* เงาสะท้อนด้านบน */}
                <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Copyright --- */}
        <div className="pt-8 border-t border-slate-800 flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1">
            Copyright © {new Date().getFullYear()}.
            <p className="text-blue-500">
              <span>KTLTC</span> /งานศูนย์ข้อมูลและสารสนเทศ
            </p>
          </div>
          <p className="flex items-center gap-1">
            Designed By
            <a
              href="https://www.allmaster.store/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-blue-400 transition-colors ml-1"
            >
              All M Min
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Component ย่อยสำหรับลิงก์ใน Footer
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
      >
        {children}
      </Link>
    </li>
  );
}

// Component ย่อยสำหรับปุ่ม Social Media
function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a
      href="#"
      className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-blue-700 hover:text-white hover:scale-110 transition-all duration-300 border border-slate-700"
    >
      {icon}
    </a>
  );
}
