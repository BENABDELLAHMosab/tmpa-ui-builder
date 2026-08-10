import { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as customComponentService from '../services/customComponent.service';

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const createCustomComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user!.id;
    const { name, description, template } = req.body;

    const component = await customComponentService.createCustomComponent({
      ownerId,
      name,
      description,
      template
    });

    const dto = {
      id: component._id,
      name: component.name,
      description: component.description,
      template: component.template,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt
    };

    res.status(201).json(dto);
  } catch (error: any) {
    if (error.code === 'DUPLICATE_KEY') {
      res.status(409).json({ error: error.message });
      return;
    }
    if (error.message && (error.message.includes('missing') || error.message.includes('Invalid') || error.message.includes('array') || error.message.includes('required') || error.message.includes('Component') || error.message.includes('empty'))) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listCustomComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user!.id;
    const components = await customComponentService.listCustomComponents(ownerId);
    res.status(200).json(components);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ error: 'Invalid component ID' });
      return;
    }

    const ownerId = req.user!.id;
    const component = await customComponentService.getCustomComponent(id, ownerId);

    if (!component) {
      res.status(404).json({ error: 'Custom component not found' });
      return;
    }

    res.status(200).json({
      id: component._id,
      name: component.name,
      description: component.description,
      template: component.template,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomComponentMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ error: 'Invalid component ID' });
      return;
    }

    const ownerId = req.user!.id;
    const { name, description } = req.body;

    const component = await customComponentService.updateCustomComponentMetadata(id, ownerId, { name, description });

    if (!component) {
      res.status(404).json({ error: 'Custom component not found' });
      return;
    }

    res.status(200).json({
      id: component._id,
      name: component.name,
      description: component.description,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt
    });
  } catch (error: any) {
    if (error.code === 'DUPLICATE_KEY') {
      res.status(409).json({ error: error.message });
      return;
    }
    if (error.message && error.message.includes('empty')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCustomComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ error: 'Invalid component ID' });
      return;
    }

    const ownerId = req.user!.id;
    const deleted = await customComponentService.deleteCustomComponent(id, ownerId);

    if (!deleted) {
      res.status(404).json({ error: 'Custom component not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
