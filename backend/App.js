import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import categoryRouter from "./routes/CategoryRouter.js";
import supplierRouter from "./routes/SupplierRouter.js";
import materialRouter from "./routes/MaterialRouter.js";
import roleRouter from "./routes/RoleRouter.js";
import shopRouter from "./routes/ShopRouter.js";
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
import divisionPlantRouter from "./routes/DivisionPlantRouter.js";
import productRouter from "./routes/ProductRouter.js";
import cartRouter from "./routes/CartRouter.js";
import wishlistRouter from "./routes/WishlistRouter.js";
import myOrderRouter from "./routes/MyOrderRouter.js";
import orderRouter from "./routes/OrderRouter.js";
import userWarehouseROuter from "./routes/UserWarehouseRouter.js";
import approvalRouter from "./routes/ApprovalRouter.js";
import "./models/index.js";
import "./jobs/CronJob.js";
import { verifyToken } from "./middleware/VerifyToken.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: ["http://localhost:3000", "http://localhost:4000"] }));
app.use(cookieParser());
app.use(express.json());

// auth router
app.use("/api", authRouter);
// app.use(verifyToken);

// master data router
app.use("/api", categoryRouter);
app.use("/api", supplierRouter);
app.use("/api", materialRouter);
app.use("/api", roleRouter);
app.use("/api", shopRouter);
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
app.use("/api", divisionPlantRouter);
app.use("/api", userWarehouseROuter);

// management stock router
app.use("/api", managementStockRouter);

// eCommerce router
app.use("/api", productRouter);
app.use("/api", cartRouter);
app.use("/api", wishlistRouter);
app.use("/api", myOrderRouter);
app.use("/api", orderRouter);

// approval router
app.use("/api", approvalRouter);

// incoming router
app.use("/api", incomingRouter);

// upload router
app.use("/api", uploadRouter);

// chart router
app.use("/api", chartRouter);

app.listen(port, () => console.log(`Server running at port ${port}`));
