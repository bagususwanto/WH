import db from "../utils/Database.js";
import Category from "./CategoryModel.js";
import Supplier from "./SupplierModel.js";
import Role from "./RoleModel.js";
import Plant from "./PlantModel.js";
import AdressRack from "./AddressRackModel.js";
import Storage from "./StorageModel.js";
import Shop from "./ShopModel.js";
import Material from "./MaterialModel.js";
import User from "./UserModel.js";
import GoodIssue from "./GoodIssueModel.js";
import Order from "./OrderModel.js";
import DetailOrder from "./DetailOrderModel.js";
import DetailGoodIssue from "./DetailGoodIssue.js";
import Inventory from "./InventoryModel.js";
import Retur from "./ReturModel.js";
import Incoming from "./IncomingModel.js";
import LogEntry from "./LogEntryModel.js";
import LogImport from "./LogImportModel.js";

(async () => {
  try {
    await db.sync();
    // await db.sync({force: true});
    // await LogImport.sync({ alter: true });
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Unable to sync the database:", error);
  }
})();
