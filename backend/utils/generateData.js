import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Supplier from "../models/SupplierModel.js";

// Fungsi untuk membaca file JSON
const readJsonFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
};

// Fungsi untuk membuat data supplier dari file JSON
const createData = async (filePath) => {
  try {
    const jsonData = await readJsonFile(filePath);
    const result = await Supplier.bulkCreate(jsonData);
    console.log(`${result.length} entries created from supplier`);
  } catch (error) {
    console.error("Error creating suppliers:", error);
  }
};

// Fungsi untuk memperbarui data supplier dari file JSON
const updateData = async (filePath) => {
  try {
    const jsonData = await readJsonFile(filePath);
    for (const data of jsonData) {
      const [updated] = await Supplier.update(
        { supplierCode: data.supplierCode },
        {
          where: { supplierName: data.supplierName },
        }
      );
      if (updated) {
        console.log(`Data with ID ${data.supplierName} updated`);
      } else {
        console.log(`No data found with ID ${data.supplierName}`);
      }
    }
  } catch (error) {
    console.error("Error updating datas:", error);
  }
};

(async () => {
  const filePath = path.join(__dirname, "data", "suppliers.json"); // Sesuaikan path file JSON
  await createData(filePath);
  //   await updateData(filePath);
})();
