import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import https from "https";
import fs from "fs";
import path from "path";
import "./models/index.js";
import categoryRouter from "./routes/CategoryRouter.js";
import supplierRouter from "./routes/SupplierRouter.js";
import materialRouter from "./routes/MaterialRouter.js";
import roleRouter from "./routes/RoleRouter.js";
import plantRouter from "./routes/PlantRoute.js";
import userRouter from "./routes/UserRouter.js";
import storageRouter from "./routes/StorageRouter.js";
import addressRackRouter from "./routes/AddressRackRouter.js";
import costCenterRouter from "./routes/CostCenterRouter.js";
import managementStockRouter from "./routes/ManagementStockRouter.js";
import authRouter from "./routes/AuthRouter.js";
import incomingRouter from "./routes/IncomingRouter.js";
import uploadRouter from "./routes/UploadRouter.js";
import chartRouter from "./routes/ChartRouter.js";
import departmentRouter from "./routes/DepartmentRouter.js";
import divisionRouter from "./routes/DivisionRouter.js";
import wbsRouter from "./routes/WBSRouter.js";
import groupRouter from "./routes/GroupRouter.js";
import sectionRouter from "./routes/SectionRouter.js";
import shiftRouter from "./routes/ShiftRouter.js";
import lineRouter from "./routes/LineRouter.js";
import warehouseRouter from "./routes/WarehouseRouter.js";
import gicRouter from "./routes/GICRouter.js";
import organizationRouter from "./routes/OrganizationRouter.js";
import serviceHoursRouter from "./routes/ServiceHoursRouter.js";
import userPlantRouter from "./routes/UserPlantRouter.js";
import productRouter from "./routes/ProductRouter.js";
import cartRouter from "./routes/CartRouter.js";
import wishlistRouter from "./routes/WishlistRouter.js";
import myOrderRouter from "./routes/MyOrderRouter.js";
import orderRouter from "./routes/OrderRouter.js";
import userWarehouseRouter from "./routes/UserWarehouseRouter.js";
import approvalRouter from "./routes/ApprovalRouter.js";
import harcodedRouter from "./routes/HarcodedRouter.js";
import notificationRouter from "./routes/NotificationRouter.js";
import warehouseProcessRouter from "./routes/WarehouseProcessRouter.js";
import orderHistoryRouter from "./routes/OrderHistoryRouter.js";
import goodIssueRouter from "./routes/GoodIssueRouter.js";
import packagingRouter from "./routes/PackagingRouter.js";
import redpostRouter from "./routes/RedpostRouter.js";
import materialStorageRouter from "./routes/MaterialStorageRouter.js";
import deliveryScheduleRouter from "./routes/DeliveryScheduleRouter.js";
import deliveryNoteRouter from "./routes/DeliveryNoteRouter.js";
import vendorMovementRouter from "./routes/VendorMovementRouter.js";
import publicRouter from "./routes/PublicRouter.js";
import "./jobs/CronJob.js";
import { verifyToken } from "./middleware/VerifyToken.js";
import logger from "./middleware/logger.js";
// import { checkPasswordExpiration } from "./middleware/CheckPasswordExpiration.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const host = process.env.DB_SERVER || "localhost";

// Mengambil path direktori saat ini dan menghilangkan duplicate C:
let __dirname = path.dirname(new URL(import.meta.url).pathname);
if (process.platform === "win32") {
  __dirname = __dirname.substring(1); // Removes extra leading slash on Windows
}

// Mengatur path untuk menyimpan gambar produk
app.use(
  "/uploads/products",
  express.static(path.join(__dirname, "resources/uploads/products"))
);

// Mengatur path untuk gambar profile user
app.use(
  "/uploads/profiles",
  express.static(path.join(__dirname, "resources/uploads/profiles"))
);

// Mengambil sertifikat dan kunci
const privateKey = fs.readFileSync(
  path.join(__dirname, "certificates", "key.pem"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.join(__dirname, "certificates", "cert.pem"),
  "utf8"
);
const credentials = { key: privateKey, cert: certificate };

// Middleware
app.use(
  cors({
    credentials: true,
    origin: [
      "http://10.65.133.99:3000",
      "http://10.65.132.46:4000",
      "http://10.65.132.153:4000",
      "http://localhost:4000",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3005",
      "https://twiis-toyota.web.app",
      "https://twiis-gi-toyota.web.app",
      "https://twiis-receiving-toyota.web.app",
      "https://redpost-warehouse.web.app",
      "https://g5xqwfz1-3001.asse.devtunnels.ms",
    ],
  })
);
app.use(cookieParser());
app.use(express.json());

// Middleware untuk log
app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  logger.info(`Client IP: ${ip}`); // Menyimpan log menggunakan winston
  next();
});

// Auth router
app.use("/api", authRouter);
app.use("/api", publicRouter);

app.use(verifyToken);
// app.use(checkPasswordExpiration);

// Master data router
app.use("/api", categoryRouter);
app.use("/api", supplierRouter);
app.use("/api", materialRouter);
app.use("/api", roleRouter);
app.use("/api", plantRouter);
app.use("/api", userRouter);
app.use("/api", storageRouter);
app.use("/api", addressRackRouter);
app.use("/api", costCenterRouter);
app.use("/api", departmentRouter);
app.use("/api", divisionRouter);
app.use("/api", wbsRouter);
app.use("/api", groupRouter);
app.use("/api", sectionRouter);
app.use("/api", shiftRouter);
app.use("/api", lineRouter);
app.use("/api", warehouseRouter);
app.use("/api", gicRouter);
app.use("/api", organizationRouter);
app.use("/api", serviceHoursRouter);
app.use("/api", userPlantRouter);
app.use("/api", userWarehouseRouter);
app.use("/api", materialStorageRouter);
app.use("/api", packagingRouter);
app.use("/api", deliveryScheduleRouter);
app.use("/api", deliveryNoteRouter);

// Harcoded router
app.use("/api", harcodedRouter);

// Management stock router
app.use("/api", managementStockRouter);

// eCommerce router
app.use("/api", productRouter);
app.use("/api", cartRouter);
app.use("/api", wishlistRouter);
app.use("/api", myOrderRouter);
app.use("/api", orderRouter);

// Order history router
app.use("/api", orderHistoryRouter);

// Approval router
app.use("/api", approvalRouter);

// Warehouse process router
app.use("/api", warehouseProcessRouter);

// Incoming router
app.use("/api", incomingRouter);

// Good issue router
app.use("/api", goodIssueRouter);

// Redpost router
app.use("/api", redpostRouter);

// Upload router
app.use("/api", uploadRouter);

// Chart router
app.use("/api", chartRouter);

// Notifications router
app.use("/api", notificationRouter);

// Vendor movement router
app.use("/api", vendorMovementRouter);

// Membuat server HTTPS
// https.createServer(credentials, app).listen(port, () => {
//   console.log(`Server running at https://${host}:${port}`);
// });

// Membuat server HTTP
app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
});
