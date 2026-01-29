import clientPromise from "@/lib/db";
import Link from "next/link";
import ManageNewsList from "@/components/ManageNewsList"; // ✅ Import Component ใหม่

export const revalidate = 0;

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
    const news = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 })
      .project({
        title: 1,
        category: 1,
        categories: 1,
        images: 1,
        announcementImages: 1,
        createdAt: 1,
      })
      .toArray();

    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function ManageNewsPage() {
  const newsList = await getNews();

  return (
    <div className="max-w-7xl mx-auto w-full p-4 text-zinc-800 dark:text-zinc-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight dark:text-white">
            จัดการข่าวสาร
          </h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base dark:text-zinc-400">
            รายการข่าวประชาสัมพันธ์ทั้งหมด ({newsList.length} รายการ)
          </p>
        </div>

        <Link
          href="/dashboard/news/add"
          className="w-full md:w-auto flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-3 md:py-2.5 rounded-xl md:rounded-full font-bold hover:bg-blue-500 shadow-md shadow-blue-200 transition-all active:scale-95 text-sm md:text-base dark:shadow-none dark:hover:bg-blue-500"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          เพิ่มข่าวใหม่
        </Link>
      </div>

      {/* ✅ เรียกใช้ Client Component เพื่อแสดงผลและทำ Pagination */}
      <ManageNewsList newsList={newsList} />
    </div>
  );
}
