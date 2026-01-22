export const uploadToCloudinary = async (
  file: File,
): Promise<string | null> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ตรวจสอบว่ามีการตั้งค่า env หรือไม่ก่อนเริ่มทำงาน
  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary configuration missing in .env");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    // ตรวจสอบ Error จาก Cloudinary API โดยตรง
    if (data.error) {
      console.error("Cloudinary API Error:", data.error.message);
      return null;
    }

    return data.secure_url;
  } catch (error) {
    console.error("Network/Upload error:", error);
    return null;
  }
};
