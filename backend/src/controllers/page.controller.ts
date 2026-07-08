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
    const pages = await Page.find(query).sort({ updatedAt: -1 });
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
