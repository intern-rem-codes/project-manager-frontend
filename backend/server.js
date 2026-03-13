import express from "express";
import cors from "cors";
import projectsRouter from "./src/routes/projects.js";
import filesRouter from "./src/routes/files.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/projects", projectsRouter);
app.use("/api/files", filesRouter);

// Serve uploaded files
app.use("/uploads", express.static("backend/uploads"));

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

