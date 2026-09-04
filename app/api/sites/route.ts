import { NextResponse } from "next/server"; import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() { try { const sites = await prisma.site.findMany({ orderBy: { id: "desc", }, include: { customer: true, ups: true, }, });
return NextResponse.json(sites);
} catch (error) { console.error("SITE GET ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء جلب المواقع" },
  { status: 500 }
);
} }
export async function POST(request: Request) { try { const body = await request.json();
if (!body.name || !body.name.trim()) {
  return NextResponse.json(
    { error: "اسم الموقع مطلوب" },
    { status: 400 }
  );
}

const customerId = Number(body.customerId);

if (!customerId) {
  return NextResponse.json(
    { error: "يجب اختيار العميل" },
    { status: 400 }
  );
}

const customer = await prisma.customer.findUnique({
  where: {
    id: customerId,
  },
});

if (!customer) {
  return NextResponse.json(
    { error: "العميل غير موجود" },
    { status: 404 }
  );
}

const site = await prisma.site.create({
  data: {
    name: body.name.trim(),
    address: body.address?.trim() || "",
    phone: body.phone?.trim() || "",
    customerId,
  },
  include: {
    customer: true,
  },
});

return NextResponse.json(site, { status: 201 });
} catch (error) { console.error("SITE POST ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء إضافة الموقع" },
  { status: 500 }
);
} }
export async function PUT(request: Request) { try { const body = await request.json();
const id = Number(body.id);
const customerId = Number(body.customerId);

if (!id) {
  return NextResponse.json(
    { error: "رقم الموقع غير صحيح" },
    { status: 400 }
  );
}

if (!body.name || !body.name.trim()) {
  return NextResponse.json(
    { error: "اسم الموقع مطلوب" },
    { status: 400 }
  );
}

if (!customerId) {
  return NextResponse.json(
    { error: "يجب اختيار العميل" },
    { status: 400 }
  );
}

const customer = await prisma.customer.findUnique({
  where: {
    id: customerId,
  },
});

if (!customer) {
  return NextResponse.json(
    { error: "العميل غير موجود" },
    { status: 404 }
  );
}

const site = await prisma.site.update({
  where: {
    id,
  },
  data: {
    name: body.name.trim(),
    address: body.address?.trim() || "",
    phone: body.phone?.trim() || "",
    customerId,
  },
  include: {
    customer: true,
  },
});

return NextResponse.json(site);
} catch (error) { console.error("SITE PUT ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء تعديل الموقع" },
  { status: 500 }
);
} }
export async function DELETE(request: Request) { try { const body = await request.json();
const id = Number(body.id);

if (!id) {
  return NextResponse.json(
    { error: "رقم الموقع غير صحيح" },
    { status: 400 }
  );
}

const site = await prisma.site.findUnique({
  where: {
    id,
  },
  include: {
    ups: true,
    maintenanceOrders: true,
  },
});

if (!site) {
  return NextResponse.json(
    { error: "الموقع غير موجود" },
    { status: 404 }
  );
}

if (
  site.ups.length > 0 ||
  site.maintenanceOrders.length > 0
) {
  return NextResponse.json(
    {
      error:
        "لا يمكن حذف الموقع لأنه مرتبط بأجهزة UPS أو أوامر صيانة",
    },
    { status: 400 }
  );
}

await prisma.site.delete({
  where: {
    id,
  },
});

return NextResponse.json({
  success: true,
});
} catch (error) { console.error("SITE DELETE ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء حذف الموقع" },
  { status: 500 }
);
} }