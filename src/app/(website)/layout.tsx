import Navbar from "@/components/Navbar"; // ถ้าต้องการ Navbar สีดำด้านบนด้วย

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans pb-20">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
