import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Asset from '../models/asset.model';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function checkImageSignature(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  // WEBP: RIFF .... WEBP
  if (mimeType === 'image/webp') {
    return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
           buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  }
  return false;
}

export const uploadAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const { originalname, mimetype, size, buffer } = req.file;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(mimetype)) {
      res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." });
      return;
    }

    if (size > MAX_SIZE) {
      res.status(400).json({ error: "File too large. Maximum size is 5MB." });
      return;
    }

    if (!checkImageSignature(buffer, mimetype)) {
      res.status(400).json({ error: "Invalid file content or corrupted image." });
      return;
    }

    const newAsset = new Asset({
      ownerId: req.user?.id,
      originalName: originalname,
      mimeType: mimetype,
      size,
      data: buffer
    });

    const savedAsset = await newAsset.save();

    res.status(201).json({
      id: savedAsset._id,
      originalName: savedAsset.originalName,
      mimeType: savedAsset.mimeType,
      size: savedAsset.size
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid asset ID" });
      return;
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    // Role check: admin can see all, developer can only see their own
    if (req.user?.role === "user-developer" && asset.ownerId.toString() !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('Content-Length', asset.size);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    
    res.send(asset.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
