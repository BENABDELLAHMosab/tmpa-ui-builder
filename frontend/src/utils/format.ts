import type { PageVersionReason } from '../types/page';

export const getPageVersionReasonLabel = (reason: PageVersionReason): string => {
  const map: Record<PageVersionReason, string> = {
    "initial": "Initial version",
    "legacy-baseline": "Imported baseline",
    "manual-save": "Manual save",
    "restore": "Restored version",
    "publication": "Publication"
  };
  return map[reason] || "Unknown change";
};

export const formatDate = (isoDate: string): string => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(isoDate));
  } catch {
    return "Unknown date";
  }
};
