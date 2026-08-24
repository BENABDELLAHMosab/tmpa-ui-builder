import type { BuilderComponent } from '../types/page';

export const extractFormatting = (component: BuilderComponent) => {
  return component.style ? JSON.parse(JSON.stringify(component.style)) : undefined;
};

export const applyFormatting = (target: BuilderComponent, source: BuilderComponent): BuilderComponent => {
  if (target.type !== source.type) {
    return target;
  }

  const formatting = extractFormatting(source);

  return {
    ...target,
    style: formatting
  };
};
