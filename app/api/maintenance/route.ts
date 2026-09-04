import { NextResponse } from "next/server"; import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() { try { const orders = await prisma.maintenanceOrder.findMany({ orderBy: { id: "desc", }, include: { customer: true, site: true, ups: true, }, });
return NextResponse.json(orders);
} catch (error) { console.error("MAINTENANCE GET ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء جلب أوامر الصيانة" },
  { status: 500 }
);
} }
export async function POST(request: Request) { try { const body = await request.json();
const order = await prisma.maintenanceOrder.create({
  data: {
    orderNumber: body.orderNumber,
    customerId: Number(body.customerId),
    siteId: Number(body.siteId),
    upsId: Number(body.upsId),

    status: body.status || "مستلم",

    faultType: body.faultType || "",
    faultCode: body.faultCode || "",

    diagnosis: body.diagnosis || "",
    actionTaken: body.actionTaken || "",
    notes: body.notes || "",

    receivedAt: body.receivedAt
      ? new Date(body.receivedAt)
      : new Date(),
  },

  include: {
    customer: true,
    site: true,
    ups: true,
  },
});

return NextResponse.json(order, { status: 201 });
} catch (error) { console.error("MAINTENANCE POST ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء حفظ أمر الصيانة" },
  { status: 500 }
);
} }