const safeFallback = (name) =>
  name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");

const encodeName = (name) =>
  encodeURIComponent(name.toWellFormed()).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

const contentDisposition = (name) =>
  `attachment; filename="${safeFallback(name)}"; filename*=UTF-8''${encodeName(name)}`;

export default contentDisposition;
