import clientPromise from "@/lib/db";
import Navbar from "@/components/Navbar";
import NewsListClient from "@/components/NewsListClient";
import RefreshButton from "@/components/RefreshButton"; // ✅ Import ปุ่มมาใช้

interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  images?: string[];
  announcementImages?: string[];
  createdAt: string;
}

async function getNews(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const collection = db.collection("news");

    // สร้าง Index อัตโนมัติ (ป้องกัน Error Memory Limit)
    try {
      await collection.createIndex({ createdAt: -1 });
    } catch (idxError) {
      console.log("Index check:", idxError);
    }

    // ดึงข้อมูลข่าว
    const news = await collection
      .find({})
      .project({
        title: 1,
        category: 1,
        categories: 1,
        createdAt: 1,
        images: { $slice: 1 }, // เอาแค่รูปแรก
        announcementImages: { $slice: 1 }, // เอาแค่รูปแรก
      })
      .sort({ createdAt: -1 })
      .limit(100) // ดึงมา 100 รายการเพื่อให้ Client ค้นหาได้ครอบคลุม
      .toArray();

    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export default async function AllNewsPage() {
  const newsList = await getNews();

  return (
    <main className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <Navbar />

      <div className="pt-20 md:pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* ✅ ส่วนแสดงปุ่มรีเฟรช (จัดชิดขวา) */}
          <div className="flex justify-end -mb-5 relative z-10">
            <RefreshButton />
          </div>

          {/* รายการข่าว */}
          <div className="-mx-6 md:-mx-10">
            <NewsListClient initialNews={newsList} />
          </div>
        </div>
      </div>
    </main>
  );
}
