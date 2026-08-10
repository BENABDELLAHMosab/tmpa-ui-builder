import type { BuilderComponent } from '../types/page';
import type { CustomComponentTemplate } from '../types/customComponent';

export const instantiateCustomComponent = (
  template: CustomComponentTemplate,
  dropPosition: { x: number; y: number },
  zIndex: number
): BuilderComponent[] => {
  const idMap = new Map<string, string>();

  // Pass 1: Generate new IDs
  template.components.forEach(comp => {
    // Generate a new ID for the component
    // We use the existing generateId utility or the comp_ convention
    // Since generateId is robust, we use it with 'comp' prefix, but to perfectly match BuilderPage's `comp_`
    const newId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    idMap.set(comp.id, newId);
  });

  // Pass 2: Clone and remap
  const instantiatedComponents: BuilderComponent[] = [];
  
  for (const comp of template.components) {
    const newId = idMap.get(comp.id);
    if (!newId) continue; // Should never happen based on Pass 1

    let newParentId: string | null = null;
    if (comp.parentId) {
      newParentId = idMap.get(comp.parentId) || null;
      if (!newParentId) {
        // Incoherent template (parent not found)
        return [];
      }
    }

    const newComp: BuilderComponent = {
      ...JSON.parse(JSON.stringify(comp)),
      id: newId,
      parentId: newParentId,
    };

    if (comp.id === template.rootComponentId) {
      newComp.parentId = null;
      if (newComp.layout) {
        newComp.layout.x = dropPosition.x;
        newComp.layout.y = dropPosition.y;
        newComp.layout.zIndex = zIndex;
      }
    }

    instantiatedComponents.push(newComp);
  }

  return instantiatedComponents;
};
