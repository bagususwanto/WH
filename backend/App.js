import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/AuthRouter.js";
import shopRouter from "./routes/ShopRouter.js";
import MaterialRouter from "./routes/MaterialRouter.js";
import "./models/index.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use("/api", authRouter);
app.use("/api", shopRouter);
app.use("/api", MaterialRouter);

app.listen(port, () => console.log(`Server running at port ${port}`));
