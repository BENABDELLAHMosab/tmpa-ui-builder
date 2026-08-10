import { generateContentHash, stableSerialize } from './contentHash';

export function canonicalizeCustomComponentTemplate(template: any): any {
  if (!template || !template.rootComponentId || !Array.isArray(template.components)) {
    return null;
  }

  const { rootComponentId, components } = template;

  const componentMap = new Map<string, any>();
  const childrenMap = new Map<string, any[]>();

  for (const comp of components) {
    componentMap.set(comp.id, comp);
    childrenMap.set(comp.id, []);
  }

  // Build children map
  for (const comp of components) {
    if (comp.id !== rootComponentId && comp.parentId) {
      const siblings = childrenMap.get(comp.parentId);
      if (siblings) {
        siblings.push(comp);
      }
    }
  }

  function buildNode(nodeId: string, isRoot: boolean): any {
    const original = componentMap.get(nodeId);
    if (!original) return null;

    // Clone to avoid mutation
    const canonical = JSON.parse(JSON.stringify(original));

    // Remove technical IDs
    delete canonical.id;
    delete canonical.parentId;

    // Normalize root
    if (isRoot) {
      if (canonical.layout) {
        canonical.layout.x = 0;
        canonical.layout.y = 0;
        delete canonical.layout.zIndex;
      }
    }

    // Process children
    const children = childrenMap.get(nodeId) || [];
    const canonicalChildren = children.map(c => buildNode(c.id, false)).filter(Boolean);

    // Sort children deterministically
    canonicalChildren.sort((a, b) => {
      const zA = a.layout?.zIndex || 0;
      const zB = b.layout?.zIndex || 0;
      if (zA !== zB) {
        return zA - zB;
      }
      // Fallback to stableSerialize for stable and key-order independent sorting
      const strA = stableSerialize(a);
      const strB = stableSerialize(b);
      return strA.localeCompare(strB);
    });

    canonical.children = canonicalChildren;

    return canonical;
  }

  return buildNode(rootComponentId, true);
}

export function generateCustomComponentContentHash(template: any): string {
  const canonical = canonicalizeCustomComponentTemplate(template);
  if (!canonical) {
    throw new Error('Invalid template for hashing');
  }
  return generateContentHash(canonical);
}
