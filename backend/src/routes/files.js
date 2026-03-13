import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";

const router = express.Router();

const uploadDir = path.resolve("backend/uploads");
await fs.mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.array("files"), (req, res) => {
  const files = (req.files ?? []).map((f) => ({
    id: f.filename,
    name: f.originalname,
    url: `/uploads/${f.filename}`,
  }));
  res.json(files);
});

router.delete("/:id", async (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);
  try {
    await fs.unlink(filePath);
    res.status(204).end();
  } catch {
    res.status(404).json({ message: "File not found" });
  }
});

router.get("/:id", async (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);
  try {
    await fs.access(filePath);
    res.download(filePath);
  } catch {
    res.status(404).json({ message: "File not found" });
  }
});

export default router;

