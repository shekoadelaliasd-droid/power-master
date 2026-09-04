import { NextResponse } from "next/server"; import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() { try { const customers = await prisma.customer.findMany({ orderBy: { id: "desc", }, include: { sites: true, ups: true, }, });
return NextResponse.json(customers);
} catch (error) { console.error("CUSTOMER GET ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء جلب العملاء" },
  { status: 500 }
);
} }
export async function POST(request: Request) { try { const body = await request.json();
if (!body.name || !body.name.trim()) {
  return NextResponse.json(
    { error: "اسم العميل مطلوب" },
    { status: 400 }
  );
}

const customer = await prisma.customer.create({
  data: {
    name: body.name.trim(),
    phone: body.phone?.trim() || "",
    notes: body.notes?.trim() || "",

    sites: body.siteName?.trim()
      ? {
          create: {
            name: body.siteName.trim(),
            address: body.siteAddress?.trim() || "",
            phone: body.sitePhone?.trim() || "",
          },
        }
      : undefined,
  },

  include: {
    sites: true,
  },
});

return NextResponse.json(customer, {
  status: 201,
});
} catch (error) { console.error("CUSTOMER POST ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء إضافة العميل" },
  { status: 500 }
);
} }
export async function PUT(request: Request) { try { const body = await request.json();
const id = Number(body.id);

if (!id) {
  return NextResponse.json(
    { error: "رقم العميل غير صحيح" },
    { status: 400 }
  );
}

if (!body.name || !body.name.trim()) {
  return NextResponse.json(
    { error: "اسم العميل مطلوب" },
    { status: 400 }
  );
}

const customer = await prisma.customer.update({
  where: {
    id,
  },

  data: {
    name: body.name.trim(),
    phone: body.phone?.trim() || "",
    notes: body.notes?.trim() || "",
  },

  include: {
    sites: true,
  },
});

return NextResponse.json(customer);
} catch (error) { console.error("CUSTOMER PUT ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء تعديل العميل" },
  { status: 500 }
);
} }
export async function DELETE(request: Request) { try { const body = await request.json();
const id = Number(body.id);

if (!id) {
  return NextResponse.json(
    { error: "رقم العميل غير صحيح" },
    { status: 400 }
  );
}

const customer = await prisma.customer.findUnique({
  where: {
    id,
  },

  include: {
    sites: true,
    ups: true,
    maintenanceOrders: true,
  },
});

if (!customer) {
  return NextResponse.json(
    { error: "العميل غير موجود" },
    { status: 404 }
  );
}

if (
  customer.sites.length > 0 ||
  customer.ups.length > 0 ||
  customer.maintenanceOrders.length > 0
) {
  return NextResponse.json(
    {
      error:
        "لا يمكن حذف العميل لأنه مرتبط بمواقع أو أجهزة UPS أو أوامر صيانة",
    },
    { status: 400 }
  );
}

await prisma.customer.delete({
  where: {
    id,
  },
});

return NextResponse.json({
  success: true,
});
} catch (error) { console.error("CUSTOMER DELETE ERROR:", error);
return NextResponse.json(
  { error: "حدث خطأ أثناء حذف العميل" },
  { status: 500 }
);
} }