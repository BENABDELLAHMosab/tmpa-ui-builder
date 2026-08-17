import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Page from '../models/page.model';
import PageVersion from '../models/pageVersion.model';
import { generateContentHash, cloneJsonValue } from '../utils/contentHash';

export const createPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const schema = { components: [] };
    const contentHash = generateContentHash(schema);

    const newPage = new Page({
      name,
      description,
      ownerId: req.user?.id,
      status: "draft",
      schema,
      version: 0,
      contentHash
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

    const { name, description, schema: incomingSchema } = req.body;
    let schemaChanged = false;
    let incomingHash = "";

    if (incomingSchema !== undefined) {
      incomingHash = generateContentHash(incomingSchema);

      if (page.version === 0) {
        if (!incomingSchema.components || incomingSchema.components.length === 0) {
          res.status(400).json({ error: "Page is empty. Add at least one component before saving." });
          return;
        }

        let tempVersion;
        try {
          tempVersion = await PageVersion.create({
            pageId: page._id,
            versionNumber: 1,
            schemaSnapshot: cloneJsonValue(incomingSchema),
            contentHash: incomingHash,
            createdBy: req.user?.id,
            reason: "manual-save"
          });
        } catch (err: any) {
          res.status(500).json({ error: "Failed to create first page version" });
          return;
        }

        const updatedPage = await Page.findOneAndUpdate(
          { _id: page._id, version: 0 },
          {
            $set: {
              schema: incomingSchema,
              contentHash: incomingHash,
              version: 1,
              ...(name !== undefined ? { name } : {}),
              ...(description !== undefined ? { description } : {})
            }
          },
          { new: true, runValidators: true }
        );

        if (!updatedPage) {
          await PageVersion.findByIdAndDelete(tempVersion._id);
          res.status(409).json({ error: "Conflict: The page was modified by another request. Please reload." });
          return;
        }

        res.json(updatedPage);
        return;
      }

      const currentHash = page.contentHash || generateContentHash(page.schema);
      if (incomingHash !== currentHash) {
        schemaChanged = true;
      }
    }

    if (!schemaChanged) {
      if (name !== undefined) page.name = name;
      if (description !== undefined) page.description = description;
      if (incomingSchema !== undefined && !page.contentHash) {
         page.contentHash = incomingHash;
      }
      
      await page.save();
      res.json(page);
      return;
    }

    const versionCount = await PageVersion.countDocuments({ pageId: page._id });
    if (versionCount === 0 && page.version > 0) {
      const currentHash = page.contentHash || generateContentHash(page.schema);
      const baselineVersionNumber = (typeof page.version === 'number' && page.version >= 1) ? page.version : 1;
      
      try {
        await PageVersion.create({
          pageId: page._id,
          versionNumber: baselineVersionNumber,
          schemaSnapshot: cloneJsonValue(page.schema),
          contentHash: currentHash,
          createdBy: req.user?.id,
          reason: "legacy-baseline"
        });
      } catch (err: any) {
        if (err.code !== 11000) {
          throw err;
        }
      }
    }

    const currentVersion = (typeof page.version === 'number' && page.version >= 1) ? page.version : 1;
    const nextVersion = currentVersion + 1;

    let tempVersion;
    try {
      tempVersion = await PageVersion.create({
        pageId: page._id,
        versionNumber: nextVersion,
        schemaSnapshot: cloneJsonValue(incomingSchema),
        contentHash: incomingHash,
        createdBy: req.user?.id,
        reason: "manual-save"
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create provisional snapshot" });
      return;
    }

    const updatedPage = await Page.findOneAndUpdate(
      { _id: page._id, version: currentVersion },
      {
        $set: {
          schema: incomingSchema,
          contentHash: incomingHash,
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {})
        },
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    );

    if (!updatedPage) {
      await PageVersion.findByIdAndDelete(tempVersion._id);
      res.status(409).json({ error: "Conflict: The page was modified by another request. Please reload." });
      return;
    }

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

    await PageVersion.deleteMany({ pageId: page._id });
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

    if (page.version === 0) {
      res.status(400).json({ error: "Save the page before submitting it." });
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
    if (!Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: "Invalid page ID format" });
      return;
    }

    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (page.status !== "approved") {
      res.status(409).json({ error: "Only approved pages can be published" });
      return;
    }

    const currentVersion = (typeof page.version === 'number' && page.version >= 1) ? page.version : 1;

    const snapshot = await PageVersion.findOne({
      pageId: page._id,
      versionNumber: currentVersion
    }).lean();

    if (!snapshot) {
      res.status(409).json({
        error: `Cannot publish: no version snapshot found for version ${currentVersion}.`
      });
      return;
    }

    const updatedPage = await Page.findOneAndUpdate(
      { _id: page._id, status: "approved" },
      {
        $set: {
          status: "published",
          publishedVersionNumber: currentVersion,
          publishedAt: new Date(),
          publishedBy: req.user?.id
        }
      },
      { new: true }
    );

    if (!updatedPage) {
      res.status(409).json({ error: "Conflict: page status changed before publishing. Please reload." });
      return;
    }

    res.json(updatedPage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

function parsePositiveIntegerQuery(value: unknown, fallback: number, max?: number): number {
  if (typeof value !== 'string') return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return fallback;
  if (max !== undefined && parsed > max) return max;
  return parsed;
}

export const listPageVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: "Invalid page ID" });
      return;
    }

    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (req.user?.role === "user-developer" && page.ownerId.toString() !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const pageQuery = parsePositiveIntegerQuery(req.query.page, 1);
    const limitQuery = parsePositiveIntegerQuery(req.query.limit, 20, 100);
    const skip = (pageQuery - 1) * limitQuery;

    const [versions, totalItems] = await Promise.all([
      PageVersion.find({ pageId: page._id })
        .select("versionNumber createdAt createdBy reason")
        .populate("createdBy", "fullName")
        .sort({ versionNumber: -1 })
        .skip(skip)
        .limit(limitQuery)
        .lean(),
      PageVersion.countDocuments({ pageId: page._id })
    ]);

    const totalPages = Math.ceil(totalItems / limitQuery);
    
    // If page is out of bounds (but greater than 1), it will just return empty items array which is fine.

    const items = versions.map((v: any) => ({
      id: v._id.toString(),
      versionNumber: v.versionNumber,
      createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : new Date(v.createdAt).toISOString(),
      createdBy: v.createdBy ? {
        id: v.createdBy._id.toString(),
        fullName: v.createdBy.fullName
      } : null,
      reason: v.reason,
      isCurrent: v.versionNumber === ((typeof page.version === 'number' && page.version >= 1) ? page.version : 1)
    }));

    res.json({
      items,
      pagination: {
        page: pageQuery,
        limit: limitQuery,
        totalItems,
        totalPages
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export function parseStrictVersionNumber(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const num = Number(value);
  if (!Number.isSafeInteger(num) || num < 1) return null;
  return num;
}

export const getPageVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, versionNumber } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid page ID format" });
      return;
    }

    const parsedVersion = parseStrictVersionNumber(versionNumber);
    if (parsedVersion === null) {
      res.status(400).json({ error: "Invalid version number" });
      return;
    }

    const page = await Page.findById(id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    const user = req.user as any;
    if (user.role === 'user-developer' && page.ownerId.toString() !== user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const version = await PageVersion.findOne({
      pageId: page._id,
      versionNumber: parsedVersion
    })
      .select("pageId versionNumber schemaSnapshot createdAt createdBy reason")
      .populate("createdBy", "fullName")
      .lean() as any;

    if (!version) {
      res.status(404).json({ error: "Page version not found" });
      return;
    }

    const currentVersionNumber = (typeof page.version === 'number' && page.version >= 1) ? page.version : 1;

    const dto = {
      id: version._id.toString(),
      pageId: version.pageId.toString(),
      pageName: page.name,
      versionNumber: version.versionNumber,
      schemaSnapshot: version.schemaSnapshot,
      createdAt: version.createdAt instanceof Date ? version.createdAt.toISOString() : new Date(version.createdAt).toISOString(),
      createdBy: version.createdBy ? {
        id: version.createdBy._id.toString(),
        fullName: version.createdBy.fullName
      } : null,
      reason: version.reason,
      isCurrent: version.versionNumber === currentVersionNumber
    };

    res.json(dto);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const restorePageVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageId, versionNumber: versionNumberParam } = req.params;

    if (!Types.ObjectId.isValid(pageId)) {
      res.status(400).json({ error: "Invalid page ID format" });
      return;
    }

    const parsedVersion = parseStrictVersionNumber(versionNumberParam);
    if (parsedVersion === null) {
      res.status(400).json({ error: "Invalid version number" });
      return;
    }

    const { expectedVersion } = req.body;
    if (typeof expectedVersion !== 'number' || !Number.isInteger(expectedVersion) || expectedVersion < 1) {
      res.status(400).json({ error: "expectedVersion must be a positive integer" });
      return;
    }

    const page = await Page.findById(pageId);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    const user = req.user as { id: string; role: string };
    if (user.role === 'user-developer' && page.ownerId.toString() !== user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const targetVersion = await PageVersion.findOne({
      pageId: page._id,
      versionNumber: parsedVersion
    }).lean() as any;

    if (!targetVersion) {
      res.status(404).json({ error: "Page version not found" });
      return;
    }

    const allowedStatuses = ['draft', 'rejected'];
    if (!allowedStatuses.includes(page.status)) {
      res.status(409).json({
        error: `Cannot restore a version when the page status is '${page.status}'. Only draft or rejected pages can be restored.`
      });
      return;
    }

    const restoredSnapshot = cloneJsonValue(targetVersion.schemaSnapshot);
    const restoredHash = generateContentHash(restoredSnapshot);

    const currentHash = page.contentHash || generateContentHash(page.schema);
    if (restoredHash === currentHash) {
      res.status(409).json({ error: "The selected version is identical to the current content. No restore needed." });
      return;
    }

    const currentVersion = (typeof page.version === 'number' && page.version >= 1) ? page.version : 1;
    if (currentVersion !== expectedVersion) {
      res.status(409).json({ error: "Conflict: The page was modified by another request. Please reload." });
      return;
    }

    const nextVersion = currentVersion + 1;

    let tempVersion: any;
    try {
      tempVersion = await PageVersion.create({
        pageId: page._id,
        versionNumber: nextVersion,
        schemaSnapshot: restoredSnapshot,
        contentHash: restoredHash,
        createdBy: user.id,
        reason: "restore"
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create restore snapshot" });
      return;
    }

    const updateFields: Record<string, unknown> = {
      schema: restoredSnapshot,
      contentHash: restoredHash,
      status: 'draft'
    };
    if ('rejectionReason' in page) {
      updateFields.rejectionReason = "";
    }

    const updatedPage = await Page.findOneAndUpdate(
      { _id: page._id, version: currentVersion },
      {
        $set: updateFields,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    );

    if (!updatedPage) {
      await PageVersion.findByIdAndDelete(tempVersion._id);
      res.status(409).json({ error: "Conflict: The page was modified by another request. Please reload." });
      return;
    }

    res.json(updatedPage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
