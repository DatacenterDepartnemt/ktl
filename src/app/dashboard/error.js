// app/dashboard/error.js
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <p>พบข้อผิดพลาด:</p>
      <pre>{error.message}</pre>
      <button onClick={() => reset()}>ลองอีกครั้ง</button>
    </div>
  );
}
