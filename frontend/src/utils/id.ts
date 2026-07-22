export const generateId = (prefix: string): string => {
  let uuid: string;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    uuid = crypto.randomUUID();
  } else if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    uuid = array.join("-");
  } else {
    // Fallback if absolutely no crypto available (should not happen in modern browsers/node)
    uuid = Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);
  }
  return `${prefix}-${uuid}`;
};
