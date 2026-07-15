import { Request, Response } from 'express';
import Page from '../models/page.model';

export const createPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const newPage = new Page({
      name,
      description,
      ownerId: req.user?.id,
      status: "draft",
      schema: { components: [] },
      version: 1
    });

    const savedPage = await newPage.save();
    res.status(201).json(savedPage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getPages = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.user?.role === "admin" ? {} : { ownerId: req.user?.id };
    const pages = await Page.find(query)
      .sort({ updatedAt: -1 })
      .populate('ownerId', 'fullName email');
    res.json(pages);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getPageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (req.user?.role === "user-developer" && page.ownerId.toString() !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const updatePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (req.user?.role === "user-developer" && page.ownerId.toString() !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const { name, description, schema } = req.body;
    if (name !== undefined) page.name = name;
    if (description !== undefined) page.description = description;
    if (schema !== undefined) {
      page.schema = schema;
      page.markModified('schema'); // Mark as modified for Mixed type
    }

    const updatedPage = await page.save();
    res.json(updatedPage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const deletePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (req.user?.role === "user-developer" && page.ownerId.toString() !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    await page.deleteOne();
    res.json({ message: "Page deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const submitPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (req.user?.role === "user-developer" && page.ownerId.toString() !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (page.status !== "draft") {
      res.status(400).json({ error: "Only draft pages can be submitted" });
      return;
    }

    if (!page.schema || !page.schema.components || !Array.isArray(page.schema.components) || page.schema.components.length === 0) {
      res.status(400).json({ error: "Cannot submit an empty page" });
      return;
    }

    page.status = "submitted";
    const updatedPage = await page.save();
    res.json(updatedPage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const approvePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (page.status !== "submitted") {
      res.status(400).json({ error: "Only submitted pages can be approved" });
      return;
    }

    page.status = "approved";
    page.reviewedBy = req.user?.id as any;
    page.reviewedAt = new Date();
    page.rejectionReason = "";

    const updatedPage = await page.save();
    res.json(updatedPage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const rejectPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim() === '') {
      res.status(400).json({ error: "Rejection reason is required" });
      return;
    }

    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (page.status !== "submitted") {
      res.status(400).json({ error: "Only submitted pages can be rejected" });
      return;
    }

    page.status = "rejected";
    page.reviewedBy = req.user?.id as any;
    page.reviewedAt = new Date();
    page.rejectionReason = rejectionReason;

    const updatedPage = await page.save();
    res.json(updatedPage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const publishPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (page.status !== "approved") {
      res.status(409).json({ error: "Only approved pages can be published" });
      return;
    }

    page.status = "published";
    page.publishedBy = req.user?.id as any;
    page.publishedAt = new Date();

    const updatedPage = await page.save();
    res.json(updatedPage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
