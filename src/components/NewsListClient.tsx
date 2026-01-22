"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// ข้อมูลหมวดหมู่
const FILTER_CATEGORIES = [
  { value: "All", label: "ทุกหมวดหมู่" },
  { value: "PR", label: "ข่าวประชาสัมพันธ์" },
  { value: "Newsletter", label: "จดหมายข่าว" },
  { value: "Internship", label: "ฝึกประสบการณ์" },
  { value: "Announcement", label: "ข่าวประกาศ" },
  { value: "Bidding", label: "ประกวดราคา" },
  { value: "Order", label: "คำสั่งวิทยาลัย" },
];

// ชื่อเดือนภาษาไทย
const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const getCategoryLabel = (val: string) => {
  const found = FILTER_CATEGORIES.find((c) => c.value === val);
  return found ? found.label : val;
};

interface NewsItem {
  _id: string;
  title: string;
  category: string;
  images?: string[];
  createdAt: string;
}

export default function NewsListClient({
  initialNews,
}: {
  initialNews: NewsItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // State สำหรับกรอง วัน/เดือน/ปี
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedDate, setSelectedDate] = useState(""); // สำหรับระบุวันเป๊ะๆ (YYYY-MM-DD)

  // 1. ดึงรายการ "ปี" ที่มีข่าวอยู่จริง เพื่อมาทำ Dropdown
  const availableYears = useMemo(() => {
    const years = new Set(
      initialNews.map((news) => new Date(news.createdAt).getFullYear()),
    );
    // แปลงเป็น array, เรียงจากมากไปน้อย (ปีล่าสุดขึ้นก่อน)
    return Array.from(years).sort((a, b) => b - a);
  }, [initialNews]);

  // 2. ระบบกรองข่าว (Filter Logic)
  const filteredNews = useMemo(() => {
    let result = initialNews;

    // กรองหมวดหมู่
    if (selectedCategory !== "All") {
      result = result.filter((news) => news.category === selectedCategory);
    }

    // กรองคำค้นหา
    if (searchQuery) {
      result = result.filter((news) =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // กรองวันที่แบบเจาะจง (ถ้ามีการเลือกวันที่จากปฏิทิน)
    if (selectedDate) {
      result = result.filter((news) => {
        const newsDate = new Date(news.createdAt).toISOString().split("T")[0]; // ได้ YYYY-MM-DD
        return newsDate === selectedDate;
      });
    } else {
      // ถ้าไม่ได้เลือกวันเป๊ะๆ ให้กรองตาม ปี และ เดือน

      // กรองปี
      if (selectedYear !== "All") {
        result = result.filter(
          (news) =>
            new Date(news.createdAt).getFullYear() === parseInt(selectedYear),
        );
      }

      // กรองเดือน
      if (selectedMonth !== "All") {
        result = result.filter(
          (news) =>
            new Date(news.createdAt).getMonth() === parseInt(selectedMonth),
        );
      }
    }

    return result;
  }, [
    initialNews,
    searchQuery,
    selectedCategory,
    selectedYear,
    selectedMonth,
    selectedDate,
  ]);

  // ฟังก์ชันล้างค่าตัวกรองทั้งหมด
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedYear("All");
    setSelectedMonth("All");
    setSelectedDate("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* --- Filter Control Section (ส่วนควบคุมตัวกรอง) --- */}
      <div className="mb-10 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 backdrop-blur-md shadow-xl">
        {/* แถว 1: ค้นหา และ หมวดหมู่ */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 border-b border-zinc-800 pb-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
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
            <input
              type="text"
              placeholder="ค้นหาหัวข้อข่าว..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {FILTER_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* แถว 2: กรองวัน/เดือน/ปี */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* 1. เลือกปี */}
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedDate("");
              }} // ถ้าเลือกปี ให้เคลียร์วันเป๊ะๆ
              className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:border-blue-500 cursor-pointer"
            >
              <option value="All">ปีทั้งหมด</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  พ.ศ. {year + 543}
                </option>
              ))}
            </select>

            {/* 2. เลือกเดือน */}
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedDate("");
              }}
              className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:border-blue-500 cursor-pointer"
            >
              <option value="All">เดือนทั้งหมด</option>
              {THAI_MONTHS.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <span className="text-zinc-500 self-center text-sm font-bold">
              หรือ
            </span>

            {/* 3. เลือกวันเป๊ะๆ (Date Picker) */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:border-blue-500 cursor-pointer"
            />
          </div>

          {/* ปุ่มล้างค่า */}
          <button
            onClick={resetFilters}
            className="text-red-400 text-sm hover:text-red-300 underline mt-4 md:mt-0"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      </div>

      {/* --- Grid List แสดงข่าว --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredNews.map((news) => (
          <Link
            key={news._id}
            href={`/news/${news._id}`}
            className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={news.images?.[0] || "/no-image.png"}
                alt={news.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-black/70 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {getCategoryLabel(news.category)}
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              {/* แสดงวันที่แบบไทย */}
              <div className="text-blue-400 text-xs font-bold mb-2">
                {new Date(news.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {news.title}
              </h3>
              <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
                <span>อ่านเพิ่มเติม</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* กรณีไม่เจอข่าว */}
      {filteredNews.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-zinc-500 text-lg">
            ไม่พบข่าวในช่วงเวลาที่คุณเลือก
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 text-blue-500 hover:underline"
          >
            ดูข่าวทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
}
