export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-zinc-500 font-bold animate-pulse">
        กำลังโหลดรายการข่าว...
      </p>
    </div>
  );
}
