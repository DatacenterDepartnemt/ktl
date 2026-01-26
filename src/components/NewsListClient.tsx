"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// ข้อมูลหมวดหมู่สำหรับ Filter
const FILTER_CATEGORIES = [
  { value: "All", label: "ทั้งหมด" },
  { value: "PR", label: "ข่าวประชาสัมพันธ์" },
  { value: "Newsletter", label: "จดหมายข่าว" },
  { value: "Internship", label: "ฝึกประสบการณ์" },
  { value: "Announcement", label: "ข่าวประกาศ" },
  { value: "Bidding", label: "ประกวดราคา" },
  { value: "Order", label: "คำสั่งวิทยาลัย" },
];

interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  images?: string[];
  announcementImages?: string[];
  createdAt: string;
}

export default function NewsListClient({
  initialNews = [],
}: {
  initialNews: NewsItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- Logic การกรองข้อมูล (Filter) ---
  const filteredNews = useMemo(() => {
    let result = Array.isArray(initialNews) ? initialNews : [];

    // 1. กรองหมวดหมู่
    if (selectedCategory !== "All") {
      result = result.filter((news) => {
        const cats = news.categories || (news.category ? [news.category] : []);

        if (selectedCategory === "Newsletter") {
          return cats.some(
            (c) => c === "Newsletter" || c === "จดหมายข่าวประชาสัมพันธ์",
          );
        }
        return cats.includes(selectedCategory);
      });
    }

    // 2. กรองคำค้นหา
    if (searchQuery) {
      result = result.filter((news) =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return result;
  }, [initialNews, searchQuery, selectedCategory]);

  return (
    <div className="w-full pb-20">
      {/* --- Filter Bar --- */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="ค้นหาข่าว..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 bg-slate-50"
          />
        </div>

        {/* Categories (Pills) */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- News Grid --- */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNews.map((news) => {
            const displayCats =
              news.categories && news.categories.length > 0
                ? news.categories
                : news.category
                  ? [news.category]
                  : ["ทั่วไป"];

            const coverImage =
              news.announcementImages && news.announcementImages.length > 0
                ? news.announcementImages[0]
                : news.images && news.images.length > 0
                  ? news.images[0]
                  : "/no-image.png";

            return (
              <Link
                key={news._id}
                href={`/news/${news._id}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full"
              >
                {/* 1. Image Cover */}
                {/* ✅ แก้ไข aspect-[4/3] เป็น aspect-[1.33] หรือ aspect-video เพื่อเลี่ยง warning */}
                <div className="relative aspect-[1.33] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={coverImage}
                    alt={news.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[90%]">
                    {displayCats.slice(0, 2).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white/90 backdrop-blur text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Content */}
                <div className="p-5 flex flex-col flex-1 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-slate-400 text-xs font-medium">
                      {new Date(news.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {news.title}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center text-blue-600 text-sm font-bold">
                    อ่านรายละเอียด
                    <svg
                      className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
          <svg
            className="w-16 h-16 mb-4 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p>ไม่พบข้อมูลข่าวสาร</p>
        </div>
      )}
    </div>
  );
}
