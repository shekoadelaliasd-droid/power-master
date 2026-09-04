import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const batteries = await prisma.battery.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(batteries);
  } catch (error) {
    console.error("BATTERY GET ERROR:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب البطاريات" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const battery = await prisma.battery.create({
      data: {
        type: body.type,
        power: body.power,
        quantity: Number(body.quantity),
      },
    });

    return NextResponse.json(battery, { status: 201 });
  } catch (error) {
    console.error("BATTERY POST ERROR:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة البطارية" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const battery = await prisma.battery.update({
      where: {
        id: Number(body.id),
      },
      data: {
        type: body.type,
        power: body.power,
        quantity: Number(body.quantity),
      },
    });

    return NextResponse.json(battery);
  } catch (error) {
    console.error("BATTERY PUT ERROR:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء تعديل البطارية" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    await prisma.battery.delete({
      where: {
        id: Number(body.id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BATTERY DELETE ERROR:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف البطارية" },
      { status: 500 }
    );
  }
}