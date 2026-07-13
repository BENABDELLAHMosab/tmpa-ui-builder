export type PageStatus = "draft" | "submitted" | "approved" | "rejected" | "published";

export interface PageSchema {
  components: unknown[];
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
