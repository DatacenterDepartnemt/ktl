// import EditTicketForm from "@/app/(components)/EditTicketForm";
import EditTicketForm from "../../(components)/EditTicketForm";

const getTicketById = async (id) => {
  try {
    // const res = await fetch(`http://localhost:3000/api/Tickets/${id}`, {
    const res = await fetch(`https://ktltcv3.vercel.app/api/Tickets/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch topic");
    }

    return res.json();
  } catch (error) {
    console.log(error);
    return null; // ✅ 1. เพิ่มบรรทัดนี้: ถ้า Error ให้ส่งกลับเป็น null กันโปรแกรมพัง
  }
};

const TicketPage = async ({ params }) => {
  // ✅ 2. ใน Next.js 13+ params ควรจะถูก await (ถ้าเป็น version ใหม่)
  // แต่ถ้า version เก่าใช้แบบเดิมได้ ถ้า error เรื่อง promise ให้ใส่ await params
  const { id } = await params;
  const EDITMODE = id === "new" ? false : true;

  let updateTicketData = {};

  if (EDITMODE) {
    const result = await getTicketById(id);

    // ✅ 3. เช็คก่อนว่ามีข้อมูลไหม ค่อยดึง .foundTicket
    if (result && result.foundTicket) {
      updateTicketData = result.foundTicket;
    } else {
      // ถ้าหาไม่เจอ หรือ API Error ให้ถือว่าเป็น New Ticket หรือจะ Redirect ไป 404 ก็ได้
      console.log("Ticket not found or API error");
      updateTicketData = {
        _id: "new",
      };
    }
  } else {
    updateTicketData = {
      _id: "new",
    };
  }

  return <EditTicketForm ticket={updateTicketData} />;
};

export default TicketPage;
