export const uploadToCloudinary = async (
  file: File,
  folder: string = "ktltc_uploads", // ค่า Default ถ้าไม่ระบุโฟลเดอร์
): Promise<string | null> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ตรวจสอบว่ามีการตั้งค่า env หรือไม่
  if (!cloudName || !uploadPreset) {
    console.error("❌ Cloudinary config missing: Please check .env file");
    return null;
  }

  // เตรียมข้อมูลสำหรับส่งไป Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  // ✅ เพิ่ม Folder เพื่อจัดระเบียบรูปภาพ
  if (folder) {
    formData.append("folder", folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    // เช็ค Error จากฝั่ง Cloudinary (เช่น ไฟล์ใหญ่เกิน, นามสกุลผิด)
    if (data.error) {
      console.error("❌ Cloudinary API Error:", data.error.message);
      return null;
    }

    // ส่งคืน URL ของรูปภาพ
    return data.secure_url;
  } catch (error) {
    console.error("❌ Network/Upload error:", error);
    return null;
  }
};
