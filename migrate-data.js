import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";

const sqlite = new Database("./prisma/dev.db", { readonly: true });
const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration...\n");

  const customers = sqlite.prepare('SELECT * FROM "Customer"').all();

  for (const row of customers) {
    await prisma.customer.upsert({
      where: { id: row.id },
      update: {
        name: row.name,
        phone: row.phone ?? "",
        notes: row.notes ?? "",
      },
      create: {
        id: row.id,
        name: row.name,
        phone: row.phone ?? "",
        notes: row.notes ?? "",
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
    });
  }

  console.log("Customer: " + customers.length + " migrated");

  const sites = sqlite.prepare('SELECT * FROM "Site"').all();

  for (const row of sites) {
    await prisma.site.upsert({
      where: { id: row.id },
      update: {
        name: row.name,
        address: row.address ?? "",
        phone: row.phone ?? "",
        customerId: row.customerId,
      },
      create: {
        id: row.id,
        name: row.name,
        address: row.address ?? "",
        phone: row.phone ?? "",
        customerId: row.customerId,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
    });
  }

  console.log("Site: " + sites.length + " migrated");

  const models = sqlite.prepare('SELECT * FROM "UPSModel"').all();

  for (const row of models) {
    await prisma.uPSModel.upsert({
      where: { id: row.id },
      update: {
        name: row.name,
      },
      create: {
        id: row.id,
        name: row.name,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
    });
  }

  console.log("UPSModel: " + models.length + " migrated");

  const batteries = sqlite.prepare('SELECT * FROM "Battery"').all();

  for (const row of batteries) {
    await prisma.battery.upsert({
      where: { id: row.id },
      update: {
        type: row.type,
        power: row.power ?? "",
        quantity: row.quantity ?? 0,
      },
      create: {
        id: row.id,
        type: row.type,
        power: row.power ?? "",
        quantity: row.quantity ?? 0,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
    });
  }

  console.log("Battery: " + batteries.length + " migrated");

  const upsList = sqlite.prepare('SELECT * FROM "UPS"').all();

  for (const row of upsList) {
    await prisma.uPS.upsert({
      where: { id: row.id },
      update: {
        type: row.type,
        model: row.model,
        serial: row.serial,
        power: row.power,
        customerId: row.customerId,
        siteId: row.siteId,
      },
      create: {
        id: row.id,
        type: row.type,
        model: row.model,
        serial: row.serial,
        power: row.power,
        customerId: row.customerId,
        siteId: row.siteId,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
    });
  }

  console.log("UPS: " + upsList.length + " migrated");

  const maintenance = sqlite
    .prepare('SELECT * FROM "MaintenanceOrder"')
    .all();

  for (const row of maintenance) {
    await prisma.maintenanceOrder.upsert({
      where: { id: row.id },
      update: {
        orderNumber: row.orderNumber,
        customerId: row.customerId,
        siteId: row.siteId,
        upsId: row.upsId,
        status: row.status ?? "مستلم",
        faultType: row.faultType ?? "",
        faultCode: row.faultCode ?? "",
        diagnosis: row.diagnosis ?? "",
        actionTaken: row.actionTaken ?? "",
        notes: row.notes ?? "",
        receivedAt: new Date(row.receivedAt),
        completedAt: row.completedAt
          ? new Date(row.completedAt)
          : null,
      },
      create: {
        id: row.id,
        orderNumber: row.orderNumber,
        customerId: row.customerId,
        siteId: row.siteId,
        upsId: row.upsId,
        status: row.status ?? "مستلم",
        faultType: row.faultType ?? "",
        faultCode: row.faultCode ?? "",
        diagnosis: row.diagnosis ?? "",
        actionTaken: row.actionTaken ?? "",
        notes: row.notes ?? "",
        receivedAt: new Date(row.receivedAt),
        completedAt: row.completedAt
          ? new Date(row.completedAt)
          : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
    });
  }

  console.log(
    "MaintenanceOrder: " + maintenance.length + " migrated"
  );

  const tables = [
    ["Customer", "id"],
    ["Site", "id"],
    ["UPSModel", "id"],
    ["Battery", "id"],
    ["UPS", "id"],
    ["MaintenanceOrder", "id"],
  ];

  for (const [table, column] of tables) {
    await prisma.$executeRawUnsafe(
      'SELECT setval(pg_get_serial_sequence(\'"' +
        table +
        '"\', \'' +
        column +
        '\'), COALESCE(MAX("' +
        column +
        '"), 1), MAX("' +
        column +
        '") IS NOT NULL) FROM "' +
        table +
        '";'
    );
  }

  console.log("\nMigration completed successfully!");
}

main()
  .catch((error) => {
    console.error("\nMigration failed!");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });