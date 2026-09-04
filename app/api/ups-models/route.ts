import { NextResponse } from "next/server"; import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() { try { const models = await prisma.uPSModel.findMany({ orderBy: { name: "asc", }, });
return NextResponse.json(models);
} catch (error) { console.error("UPS MODELS GET ERROR:", error);
return NextResponse.json(
  {
    error: String(error),
  },
  {
    status: 500,
  }
);
} }