import clientPromise from "@/lib/db";
import Navbar from "@/components/Navbar"; // ตอนนี้ Navbar (Server Component) จะทำงานได้แล้ว!
import NewsListClient from "@/components/NewsListClient"; // ดึงส่วนแสดงผล Client มาใช้

// ฟังก์ชันดึงข่าว (ทำงานฝั่ง Server)
async function getNews() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const news = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return JSON.parse(JSON.stringify(news));
  } catch {
    return [];
  }
}

export default async function AllNewsPage() {
  const newsList = await getNews(); // ดึงข้อมูลก่อน render

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      <Navbar />

      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-150 h-150 bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="pt-12 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          คลังข่าวสารทั้งหมด
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500 mt-2">
            (News Archive)
          </span>
        </h1>
        <p className="text-zinc-400">
          ค้นหาและติดตามกิจกรรมย้อนหลังของวิทยาลัยเทคนิคกันทรลักษ์
        </p>
      </div>

      {/* ส่งข้อมูลไปให้ Client Component จัดการต่อ */}
      <NewsListClient initialNews={newsList} />
    </main>
  );
}
