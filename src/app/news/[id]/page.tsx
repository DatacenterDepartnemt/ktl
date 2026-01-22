import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

interface NewsItem {
  _id: string;
  title: string;
  category: string;
  content?: string;
  images?: string[];
  createdAt: string;
}

// ฟังก์ชันดึงข้อมูลข่าวตาม ID
async function getNewsDetail(id: string): Promise<NewsItem | null> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const news = await db.collection("news").findOne({ _id: new ObjectId(id) });

    if (!news) return null;
    return JSON.parse(JSON.stringify(news));
  } catch {
    return null;
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNewsDetail(id);

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">ไม่พบข่าวดังกล่าว</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb (ปุ่มย้อนกลับ) */}
        <Link
          href="/"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          ← กลับไปหน้าข่าวสาร
        </Link>

        {/* Header ข่าว */}
        <div className="mb-8 border-b border-zinc-800 pb-8">
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-sm font-bold rounded-full mb-4 border border-blue-600/30">
            {news.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-white">
            {news.title}
          </h1>
          <p className="text-zinc-500 text-sm">
            เผยแพร่เมื่อ:{" "}
            {new Date(news.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            น.
          </p>
        </div>

        {/* เนื้อหาข่าว (Content) */}
        <div className="text-lg text-zinc-300 leading-relaxed whitespace-pre-line mb-12">
          {news.content || "ไม่มีรายละเอียดเนื้อหา"}
        </div>

        {/* --- Highlight: ส่วนแสดงรูปภาพทั้งหมด (Gallery) --- */}
        {news.images && news.images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white border-l-4 border-blue-600 pl-4 mb-6">
              รูปภาพประกอบ ({news.images.length} รูป)
            </h3>

            {/* Grid รูปภาพ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.images.map((img, index) => (
                <div
                  key={index}
                  // เทคนิค: รูปแรก (index 0) ให้ขยายเต็มความกว้าง (col-span-2) เพื่อความเด่น
                  className={`relative rounded-2xl overflow-hidden border border-zinc-800 group hover:border-blue-500/50 transition-all ${
                    index === 0 ? "md:col-span-2 aspect-video" : "aspect-video"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`News Image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
