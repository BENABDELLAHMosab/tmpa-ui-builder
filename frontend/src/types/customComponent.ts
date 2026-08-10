import type { BuilderComponent } from './page';

export interface CustomComponentTemplate {
  rootComponentId: string;
  components: BuilderComponent[];
}

export interface CustomComponentSummary {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomComponentDetail extends CustomComponentSummary {
  template: CustomComponentTemplate;
}

export interface CreateCustomComponentPayload {
  name: string;
  description?: string;
  template: CustomComponentTemplate;
}

export interface CreateCustomComponentResponse {
  id: string;
  name: string;
  description: string;
  template: CustomComponentTemplate;
  createdAt: string;
  updatedAt: string;
}
