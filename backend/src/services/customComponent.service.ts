import CustomComponent from '../models/customComponent.model';
import { generateCustomComponentContentHash } from '../utils/customComponentHash';

function validateAndNormalizeTemplate(template: any): any {
  if (!template || typeof template !== 'object') {
    throw new Error('Template is missing or invalid');
  }

  const { rootComponentId, components } = template;

  if (typeof rootComponentId !== 'string' || rootComponentId.trim() === '') {
    throw new Error('Invalid rootComponentId');
  }

  if (!Array.isArray(components) || components.length === 0) {
    throw new Error('Components array is missing or empty');
  }

  // Clone to avoid mutating original
  const clonedComponents = JSON.parse(JSON.stringify(components));

  const componentMap = new Map<string, any>();
  const ids = new Set<string>();

  for (const comp of clonedComponents) {
    if (!comp.id || typeof comp.id !== 'string') {
      throw new Error('All components must have a valid string id');
    }
    if (ids.has(comp.id)) {
      throw new Error(`Duplicate component id found: ${comp.id}`);
    }
    ids.add(comp.id);
    componentMap.set(comp.id, comp);
  }

  const rootComponent = componentMap.get(rootComponentId);
  if (!rootComponent) {
    throw new Error('rootComponentId does not correspond to any component in the array');
  }

  if (rootComponent.type !== 'Container') {
    throw new Error('Root component must be of type "Container"');
  }

  // Normalize root component
  rootComponent.parentId = null;
  
  if (!rootComponent.layout) {
    rootComponent.layout = {};
  }
  rootComponent.layout.x = 0;
  rootComponent.layout.y = 0;

  for (const comp of clonedComponents) {
    if (comp.id === rootComponentId) continue;

    if (comp.parentId === comp.id) {
      throw new Error(`Component ${comp.id} cannot be its own parent`);
    }

    let current = comp;
    const path = new Set<string>();

    while (current.id !== rootComponentId) {
      if (path.has(current.id)) {
        throw new Error(`Cycle detected involving component ${current.id}`);
      }
      path.add(current.id);

      if (!current.parentId) {
        throw new Error(`Component ${comp.id} is detached from root component`);
      }

      const parent = componentMap.get(current.parentId);
      if (!parent) {
        throw new Error(`Component ${current.id} references a missing parentId: ${current.parentId}`);
      }

      current = parent;
    }
  }

  return {
    rootComponentId,
    components: clonedComponents
  };
}

export const createCustomComponent = async (data: { ownerId: string; name: string; description?: string; template: any }) => {
  const name = (data.name || '').trim();
  if (!name) {
    throw new Error('Name is required and cannot be empty');
  }

  const nameKey = name.toLowerCase();
  
  const normalizedTemplate = validateAndNormalizeTemplate(data.template);
  const contentHash = generateCustomComponentContentHash(normalizedTemplate);

  // Check for exact duplicate by contentHash
  const exactDup = await CustomComponent.findOne({ ownerId: data.ownerId, contentHash });
  if (exactDup) {
    const error: any = new Error('An identical custom component already exists.');
    error.code = 'CUSTOM_COMPONENT_CONTENT_EXISTS';
    error.existingComponent = { id: exactDup._id.toString(), name: exactDup.name };
    throw error;
  }

  // Check old documents without contentHash
  const oldDocs = await CustomComponent.find({ ownerId: data.ownerId, contentHash: { $exists: false } });
  for (const oldDoc of oldDocs) {
    try {
      const oldHash = generateCustomComponentContentHash(oldDoc.template);
      if (oldHash === contentHash) {
        oldDoc.contentHash = oldHash;
        await oldDoc.save().catch(() => {}); // best effort

        const error: any = new Error('An identical custom component already exists.');
        error.code = 'CUSTOM_COMPONENT_CONTENT_EXISTS';
        error.existingComponent = { id: oldDoc._id.toString(), name: oldDoc.name };
        throw error;
      }
      
      // Save hash for future comparisons
      oldDoc.contentHash = oldHash;
      await oldDoc.save().catch(() => {}); // best effort
    } catch (err) {
      // ignore hash generation errors for old docs
    }
  }

  const customComponent = new CustomComponent({
    ownerId: data.ownerId,
    name,
    nameKey,
    description: data.description ? data.description.trim() : '',
    contentHash,
    template: normalizedTemplate
  });

  try {
    const saved = await customComponent.save();
    return saved.toJSON();
  } catch (error: any) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.contentHash) {
        const conflictError: any = new Error('An identical custom component already exists.');
        conflictError.code = 'CUSTOM_COMPONENT_CONTENT_EXISTS';
        throw conflictError;
      } else {
        const conflictError: any = new Error('A component with this name already exists for this user');
        conflictError.code = 'DUPLICATE_KEY';
        throw conflictError;
      }
    }
    throw error;
  }
};

export const listCustomComponents = async (ownerId: string) => {
  const components = await CustomComponent.find({ ownerId })
    .select('_id name description createdAt updatedAt template')
    .sort({ createdAt: -1 })
    .lean();

  return components.map((comp: any) => {
    const { template, _id, ...rest } = comp;
    
    let rootType = 'Container';
    let rootWidth = undefined;
    let rootHeight = undefined;
    
    if (template && template.rootComponentId && Array.isArray(template.components)) {
      const rootComp = template.components.find((c: any) => c.id === template.rootComponentId);
      if (rootComp) {
        rootType = rootComp.type;
        rootWidth = rootComp.props?.style?.width;
        rootHeight = rootComp.props?.style?.height;
      }
    }
    
    return {
      id: _id.toString(),
      ...rest,
      rootType,
      rootWidth,
      rootHeight
    };
  });
};

export const getCustomComponent = async (id: string, ownerId: string) => {
  const component = await CustomComponent.findOne({ _id: id, ownerId }).lean();
  return component;
};

export const updateCustomComponentMetadata = async (id: string, ownerId: string, updates: { name?: string; description?: string }) => {
  const component = await CustomComponent.findOne({ _id: id, ownerId });
  if (!component) {
    return null;
  }

  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim();
    if (!trimmedName) {
      throw new Error('Name cannot be empty');
    }
    component.name = trimmedName;
    component.nameKey = trimmedName.toLowerCase();
  }

  if (updates.description !== undefined) {
    component.description = updates.description.trim();
  }

  try {
    const saved = await component.save();
    return saved.toJSON();
  } catch (error: any) {
    if (error.code === 11000) {
      const conflictError: any = new Error('A component with this name already exists for this user');
      conflictError.code = 'DUPLICATE_KEY';
      throw conflictError;
    }
    throw error;
  }
};

export const deleteCustomComponent = async (id: string, ownerId: string) => {
  const result = await CustomComponent.deleteOne({ _id: id, ownerId });
  return result.deletedCount > 0;
};
