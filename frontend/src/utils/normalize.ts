import type { BuilderComponent } from '../types/page';
import { normalizeComponentsLayout } from './canvas';
import { normalizeComponentParents, normalizeContainerChildrenLayout } from './container';
import { normalizeComponentLayers } from './layers';

export function normalizePageComponents(components: BuilderComponent[]): BuilderComponent[] {
  return normalizeComponentLayers(
    normalizeContainerChildrenLayout(
      normalizeComponentsLayout(
        normalizeComponentParents(components)
      )
    )
  );
}
