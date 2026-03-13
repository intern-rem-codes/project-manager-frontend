import express from "express";
import cors from "cors";
import fileRoutes from "./routes/fileRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/files", fileRoutes);

app.use("/uploads", express.static("src/uploads"));

export default app;
