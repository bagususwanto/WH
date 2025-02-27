import IncomingHistory from "../models/IncomingHistoryModel.js";
import Incoming from "../models/IncomingModel.js";
import Inventory from "../models/InventoryModel.js";
import cron from "node-cron";

// Mengapa menggunakan offset?
// Jika kita memiliki 100.000 baris data dan ingin memproses 1.000 baris per batch, kita memerlukan cara untuk mengambil batch berikutnya setelah batch pertama selesai. Di sinilah offset berperan.

// Contoh alurnya:

// Batch 1: Ambil 1.000 baris pertama (offset = 0, limit = 1000).
// Batch 2: Ambil baris dari 1.001 hingga 2.000 (offset = 1000, limit = 1000).
// Batch 3: Ambil baris dari 2.001 hingga 3.000 (offset = 2000, limit = 1000).
// Dan seterusnya hingga semua data diproses.

export const executeInventory = async () => {
  const batchSize = 1000; // Sesuaikan batch size, misal 1000 per batch
  let offset = 0; // mulai dari baris
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      // Ambil data inventory dalam batch
      const inventories = await Inventory.findAll({
        limit: batchSize,
        offset: offset,
      });

      // Jika tidak ada data lagi, berhenti looping
      if (inventories.length === 0) {
        hasMoreData = false;
        break;
      }

      // Proses setiap record dalam batch
      for (const inventory of inventories) {
        let updatedQuantityActualCheck = null;

        if (inventory.quantitySistem !== null) {
          updatedQuantityActualCheck = inventory.quantitySistem;
        }
        if (inventory.quantityActual !== null) {
          updatedQuantityActualCheck = inventory.quantityActual;
        }

        // Update hanya jika ada perubahan dan quantityActual tidak null
        if (
          inventory.quantityActual !== null &&
          inventory.quantityActualCheck !== updatedQuantityActualCheck
        ) {
          await Inventory.update(
            { quantityActualCheck: updatedQuantityActualCheck },
            { where: { id: inventory.id } }
          );
        }
      }

      await Inventory.update(
        { quantityActual: null, remarks: null },
        { where: {} }
      );

      // Increment offset untuk batch berikutnya
      offset += batchSize;
    }

    console.log("Inventory updated successfully");
  } catch (error) {
    console.error("Error updating inventory:", error);
  }
};

export const executeIncoming = async () => {
  const batchSize = 1000; // Sesuaikan batch size, misal 1000 per batch
  let offset = 0; // mulai dari baris
  let hasMoreData = true;

  try {
    // Cek apakah sudah ada data incoming history untuk tanggal hari ini
    const today = new Date().toLocaleDateString("en-CA"); // format yyyy-MM-dd
    const existingHistory = await IncomingHistory.findOne({
      where: { incomingDate: today },
    });

    // Jika sudah ada data untuk tanggal hari ini, jangan lakukan apa pun
    if (existingHistory) {
      console.log("Incoming history for today already exists. Skipping job.");
      return;
    }

    // Jika belum ada data, mulai proses batch
    while (hasMoreData) {
      // Ambil data inventory dalam batch
      const incomings = await Incoming.findAll({
        where: { incomingDate: today },
        limit: batchSize,
        offset: offset,
      });

      // Jika tidak ada data lagi, berhenti looping
      if (incomings.length === 0) {
        hasMoreData = false;
        break;
      }

      // Proses setiap record dalam batch untuk di-create di incoming history
      for (const incoming of incomings) {
        // Create incoming history
        await IncomingHistory.create({
          incomingId: incoming.id,
          planning: incoming.planning,
          actual: incoming.actual,
          incomingDate: incoming.incomingDate,
          status: incoming.status,
        });
      }

      // Increment offset untuk batch berikutnya
      offset += batchSize;
    }

    console.log("Incoming History created successfully");
  } catch (error) {
    console.error("Error creating incoming history:", error);
  }
};

// "30 7,19 * * *" adalah format cron yang menentukan waktu penjadwalan.
// Format cron memiliki 5 bagian: minute hour day-of-month month day-of-week.
// Dalam format ini:
// 30 → Menit ke-30.
// 7,19 → Eksekusi pada jam 07:30 dan 19:30 setiap hari.
// * * * → Berlaku untuk semua hari, semua bulan, dan semua hari dalam seminggu.

// Atur cron job untuk dijalankan setiap jam 07:30 dan 19:30
cron.schedule("30 7,19 * * *", () => {
  console.log("Running inventory update job...");
  executeInventory()
    .then(() => console.log("Inventory update completed."))
    .catch((error) => console.error("Error in inventory update job:", error));
});

// Atur cron job untuk dijalankan setiap jam  19:30
cron.schedule("30 19 * * *", () => {
  console.log("Running creating receiving history job...");
  executeIncoming()
    .then(() => console.log("Created receiving history completed."))
    .catch((error) =>
      console.error("Error in creating receiving history job:", error)
    );
});
