export type PageStatus = "draft" | "submitted" | "approved" | "rejected" | "published";

export type BuilderComponentType = "Text" | "Button" | "Input" | "Card" | "Table";

export interface BuilderComponent {
  id: string;
  type: BuilderComponentType;
  props: Record<string, unknown>;
}

export interface PageSchema {
  components: BuilderComponent[];
  [key: string]: unknown;
}

export interface UiPage {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  status: PageStatus;
  schema: PageSchema;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageRequest {
  name: string;
  description?: string;
}
