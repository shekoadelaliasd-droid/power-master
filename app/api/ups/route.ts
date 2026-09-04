import { NextResponse } from "next/server"; import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() { try { const ups = await prisma.uPS.findMany({ orderBy: { id: "desc", }, });
return NextResponse.json(ups);
} catch (error) { console.error("UPS GET ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء جلب أجهزة UPS" },
  { status: 500 }
);
} }
export async function POST(request: Request) { try { const body = await request.json();
const ups = await prisma.uPS.create({
  data: {
    type: body.type,
    model: body.model,
    serial: body.serial,
    power: body.power,

    // ربط الجهاز بالعميل والموقع
    customerId: body.customerId ? Number(body.customerId) : null,
    siteId: body.siteId ? Number(body.siteId) : null,
  },
});

return NextResponse.json(ups, { status: 201 });
} catch (error) { console.error("UPS POST ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء إضافة جهاز UPS" },
  { status: 500 }
);
} }
export async function PUT(request: Request) { try { const body = await request.json();
const ups = await prisma.uPS.update({
  where: {
    id: Number(body.id),
  },
  data: {
    type: body.type,
    model: body.model,
    serial: body.serial,
    power: body.power,

    customerId: body.customerId ? Number(body.customerId) : null,
    siteId: body.siteId ? Number(body.siteId) : null,
  },
});

return NextResponse.json(ups);
} catch (error) { console.error("UPS PUT ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء تعديل جهاز UPS" },
  { status: 500 }
);
} }
export async function DELETE(request: Request) { try { const body = await request.json();
await prisma.uPS.delete({
  where: {
    id: Number(body.id),
  },
});

return NextResponse.json({ success: true });
} catch (error) { console.error("UPS DELETE ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء حذف جهاز UPS" },
  { status: 500 }
);
} }