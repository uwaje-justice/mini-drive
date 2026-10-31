const previewKinds = new Map([
  ["image/png", "image"],
  ["image/jpeg", "image"],
  ["image/webp", "image"],
  ["image/gif", "image"],
  ["application/pdf", "pdf"],
  ["text/plain", "text"],
]);

const getPreviewKind = (mimeType) => previewKinds.get(mimeType) ?? null;

const isPreviewable = (mimeType) => getPreviewKind(mimeType) !== null;

export default isPreviewable;
export { getPreviewKind };
