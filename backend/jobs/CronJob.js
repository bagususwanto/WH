import Inventory from "../models/InventoryModel.js";
import cron from "node-cron";

// Mengapa menggunakan offset?
// Jika kita memiliki 100.000 baris data dan ingin memproses 1.000 baris per batch, kita memerlukan cara untuk mengambil batch berikutnya setelah batch pertama selesai. Di sinilah offset berperan.

// Contoh alurnya:

// Batch 1: Ambil 1.000 baris pertama (offset = 0, limit = 1000).
// Batch 2: Ambil baris dari 1.001 hingga 2.000 (offset = 1000, limit = 1000).
// Batch 3: Ambil baris dari 2.001 hingga 3.000 (offset = 2000, limit = 1000).
// Dan seterusnya hingga semua data diproses.

const executeInventory = async () => {
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
        if (inventory.quantityActual !== null && inventory.quantityActualCheck !== updatedQuantityActualCheck) {
          await Inventory.update({ quantityActualCheck: updatedQuantityActualCheck }, { where: { id: inventory.id } });
        }
      }

      await Inventory.update({ quantityActual: null, remarks: null }, { where: {} });

      // Increment offset untuk batch berikutnya
      offset += batchSize;
    }

    console.log("Inventory updated successfully");
  } catch (error) {
    console.error("Error updating inventory:", error);
  }
};

// Atur cron job untuk dijalankan setiap jam 12 siang dan 12 malam
cron.schedule("0 0,12 * * *", () => {
  console.log("Running inventory update job...");
  executeInventory()
    .then(() => console.log("Inventory update completed."))
    .catch((error) => console.error("Error in inventory update job:", error));
});

export default executeInventory;
