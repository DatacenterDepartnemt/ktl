import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { FootTitle } from "@/components/FootTitle";

interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  content?: string;
  images?: string[];
  announcementImages?: string[];
  links?: { label: string; url: string }[];
  createdAt: string;
}

async function getNewsDetail(id: string): Promise<NewsItem | null> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    if (!ObjectId.isValid(id)) return null;
    const news = await db.collection("news").findOne({ _id: new ObjectId(id) });
    if (!news) return null;
    return JSON.parse(JSON.stringify(news));
  } catch {
    return null;
  }
}

async function getAdjacentNews(createdAt: string) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const prevNews = await db
      .collection("news")
      .find({ createdAt: { $lt: createdAt } })
      .sort({ createdAt: -1 })
      .limit(1)
      .project({ _id: 1, title: 1 })
      .toArray();
    const nextNews = await db
      .collection("news")
      .find({ createdAt: { $gt: createdAt } })
      .sort({ createdAt: 1 })
      .limit(1)
      .project({ _id: 1, title: 1 })
      .toArray();
    return {
      prev:
        prevNews.length > 0 ? JSON.parse(JSON.stringify(prevNews[0])) : null,
      next:
        nextNews.length > 0 ? JSON.parse(JSON.stringify(nextNews[0])) : null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

function getGridClass(count: number) {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-6 text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          ไม่พบข้อมูลข่าวสารที่คุณต้องการ
        </h1>
        <Link
          href="/news"
          className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 font-bold"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  const { prev, next } = await getAdjacentNews(news.createdAt);
  const displayCategories = news.categories?.length
    ? news.categories
    : news.category
      ? [news.category]
      : ["ข่าวทั่วไป"];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Navigation & Metadata */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Link
            href="/news"
            className="inline-flex items-center text-slate-400 hover:text-blue-600 font-semibold text-sm transition-colors group"
          >
            <svg
              className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            กลับสู่หน้าข่าวสาร
          </Link>

          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {displayCategories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-blue-100"
                >
                  {cat}
                </span>
              ))}
              <span className="h-4 w-px bg-slate-200 hidden sm:block"></span>
              <time className="text-slate-400 text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(news.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            <div className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
              {/* {news.title} */}
              <p className="text-center">วิทยาลัยเทคนิคกันทรลักษ์</p>
              {/* <div className="h-1.5 w-24 bg-blue-600 rounded-full flex justify-center"></div> */}
            </div>
          </header>

          {/* Featured Content Area */}
          <section className="mt-12">
            <div
              className="prose prose-slate prose-lg max-w-none 
              prose-headings:text-slate-900 prose-headings:font-bold 
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-3xl prose-img:shadow-2xl prose-img:mx-auto"
              dangerouslySetInnerHTML={{ __html: news.content || "" }}
            />
          </section>

          {/* Links Section */}
          {news.links && news.links.length > 0 && (
            <section className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-100 my-12">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                    />
                  </svg>
                </div>
                ลิงก์ที่เกี่ยวข้องและเอกสารดาวน์โหลด
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {news.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-blue-600 truncate mr-4">
                      {link.label}
                    </span>
                    <svg
                      className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </section>
          )}

          <FootTitle />

          {/* Gallery Section */}
          {news.images && news.images.length > 0 && (
            <section className="pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  ประมวลภาพกิจกรรม
                </h3>
                <span className="text-slate-400 font-bold text-sm bg-slate-50 px-3 py-1 rounded-full">
                  {news.images.length} รูปภาพ
                </span>
              </div>
              <div className={`grid gap-6 ${getGridClass(news.images.length)}`}>
                {news.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-zoom-in border border-slate-100"
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Announcement (Official Documents) */}
          {news.announcementImages && news.announcementImages.length > 0 && (
            <section className="pt-16 max-w-2xl mx-auto space-y-10">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  ประกาศ / เอกสารแนบอย่างเป็นทางการ
                </h3>
                <p className="text-slate-400 text-sm">
                  คลิกที่รูปเพื่อดูเอกสารขนาดใหญ่
                </p>
              </div>
              <div className="space-y-8">
                {news.announcementImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full rounded-2xl overflow-hidden transition-all"
                  >
                    <Image
                      src={img}
                      alt={`Document ${idx + 1}`}
                      width={800}
                      height={1200}
                      className="w-full h-auto object-contain rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Adjacent News Navigation */}
          <nav className="pt-16 mt-16 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {prev ? (
                <Link
                  href={`/news/${prev._id}`}
                  className="group flex flex-col p-6 rounded-3xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                >
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Previous News
                  </span>
                  <span className="font-bold text-slate-600 group-hover:text-slate-900 line-clamp-2 leading-snug">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  href={`/news/${next._id}`}
                  className="group flex flex-col items-end text-right p-6 rounded-3xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                >
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    Next News
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                  <span className="font-bold text-slate-600 group-hover:text-slate-900 line-clamp-2 leading-snug">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>
        </div>
      </main>
    </div>
  );
}
