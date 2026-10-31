const previewableTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
]);

const isPreviewable = (mimeType) => previewableTypes.has(mimeType);

export default isPreviewable;
