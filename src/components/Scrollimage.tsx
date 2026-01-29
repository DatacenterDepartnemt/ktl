"use client";

import { Carousel, ConfigProvider } from "antd";
import { motion } from "framer-motion";
import Image from "next/image";

const slides = [
  "/images/banners/19.webp",
  "/images/banners/17.webp",
  "/images/banners/18.webp",
  "/images/banners/8.webp",
  "/images/banners/1.webp",
  "/images/banners/2.webp",
];

const Scrollimage: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Carousel: {
            dotActiveWidth: 30,
            dotWidth: 8,
            dotHeight: 4,
          },
        },
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative w-full max-w-7xl mx-auto mt-4 mb-8 px-4 overflow-hidden"
      >
        <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200/50 bg-slate-100">
          <Carousel
            arrows
            infinite
            autoplay
            autoplaySpeed={5000}
            effect="fade"
            className="group custom-carousel-fix"
          >
            {slides.map((src, index) => (
              <div
                key={index}
                // Aspect Ratio: 16/9 มาตรฐาน
                className="relative aspect-video w-full"
              >
                {/* Layer 1: Gradient Overlay (z-10) - ปรับให้เข้มขึ้นด้านล่างเพื่อให้ตัวหนังสือชัด */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                {/* Layer 0: Image */}
                <Image
                  src={src}
                  alt={`KTLTC Activity Slide ${index + 1}`}
                  fill
                  // ✅ Optimization: โหลดรูปแรกทันที (Priority) รูปอื่นโหลดแบบ Lazy
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />

                {/* Layer 2: Text Overlay (z-20) */}
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 text-white hidden md:block">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg md:text-3xl font-bold tracking-widest uppercase drop-shadow-md"
                  >
                    Kantharalak Technical College
                  </motion.h2>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* CSS Override สำหรับปุ่มลูกศรและจุดของ Ant Design Carousel */}
        <style jsx global>{`
          /* 1. จัดตำแหน่งจุด (Dots) */
          .custom-carousel-fix .slick-dots {
            bottom: 20px !important;
          }
          .custom-carousel-fix .slick-dots li button {
            background: rgba(255, 255, 255, 0.5) !important;
          }
          .custom-carousel-fix .slick-dots li.slick-active button {
            background: #fff !important;
          }

          /* 2. ปรับแต่งปุ่มลูกศร (Arrows) */
          .custom-carousel-fix .slick-prev,
          .custom-carousel-fix .slick-next {
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 48px !important;
            height: 48px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 50% !important;
            z-index: 30 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            opacity: 0;
            transition: all 0.3s ease;
          }

          /* สร้างรูปลูกศรด้วย CSS Pure (Chevron) */
          .custom-carousel-fix .slick-prev::after,
          .custom-carousel-fix .slick-next::after {
            content: "" !important;
            display: block !important;
            width: 10px !important;
            height: 10px !important;
            border-top: 2.5px solid white !important;
            border-right: 2.5px solid white !important;
            transform: rotate(-135deg) !important; /* ลูกศรชี้ซ้าย */
            margin-left: 4px !important;
          }

          .custom-carousel-fix .slick-next::after {
            transform: rotate(45deg) !important; /* ลูกศรชี้ขวา */
            margin-left: -4px !important;
          }

          /* แสดงปุ่มเมื่อเอาเมาส์วาง (Hover Group) */
          .custom-carousel-fix.group:hover .slick-prev {
            left: 20px;
            opacity: 1;
          }
          .custom-carousel-fix.group:hover .slick-next {
            right: 20px;
            opacity: 1;
          }

          /* Hover State ของปุ่ม */
          .custom-carousel-fix .slick-prev:hover,
          .custom-carousel-fix .slick-next:hover {
            background: #f97316 !important; /* สีส้ม Theme วิทยาลัย */
            border-color: #f97316 !important;
          }

          /* ซ่อนปุ่มบนมือถือ */
          @media (max-width: 768px) {
            .custom-carousel-fix .slick-prev,
            .custom-carousel-fix .slick-next {
              display: none !important;
            }
          }
        `}</style>
      </motion.section>
    </ConfigProvider>
  );
};

export default Scrollimage;
