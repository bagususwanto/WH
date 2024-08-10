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
import authRouter from "./routes/AuthRouter.js";
import "./models/index.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use("/api", categoryRouter);
app.use("/api", supplierRouter);
app.use("/api", materialRouter);
app.use("/api", roleRouter);
app.use("/api", shopRouter);
app.use("/api", plantRouter);
app.use("/api", authRouter);

app.listen(port, () => console.log(`Server running at port ${port}`));
