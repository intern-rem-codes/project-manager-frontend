import express from "express";
import { upload } from "../middleware/uploadMiddleware";
import { uploadFiles, deleteFile, downloadFile } from "../controllers/fileController";

const router = express.Router();

router.post("/upload", upload.array("files"), uploadFiles);
router.delete("/:id", deleteFile);
router.get("/:id", downloadFile);

export default router;