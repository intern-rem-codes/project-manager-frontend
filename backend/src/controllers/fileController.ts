import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export const uploadFiles = (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  const result = files.map(file => ({
    id: file.filename,
    name: file.originalname,
    url: `/uploads/${file.filename}`
  }));

  res.json(result);
};

export const deleteFile = (req: Request, res: Response) => {
  const id = req.params.id;

  const filePath = path.join(__dirname, "../uploads", id);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: "File not found" });
    }

    res.json({ message: "File deleted" });
  });
};

export const downloadFile = (req: Request, res: Response) => {
  const id = req.params.id;

  const filePath = path.join(__dirname, "../uploads", id);

  res.download(filePath);
};