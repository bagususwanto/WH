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
import "./models/index.js";
import "./jobs/CronJob.js";
import { verifyToken } from "./middleware/VerifyToken.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: "http://10.65.133.99:3000" }));
app.use(cookieParser());
app.use(express.json());

// auth router
app.use("/api", authRouter);
app.use(verifyToken);

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

// management stock router
app.use("/api", managementStockRouter);

// incoming router
app.use("/api", incomingRouter);

// upload router
app.use("/api", uploadRouter);

// chart router
app.use("/api", chartRouter);

app.listen(port, () => console.log(`Server running at port ${port}`));
