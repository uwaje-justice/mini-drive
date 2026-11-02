const categoryDefinitions = [
  {
    id: "photos",
    name: "Photos",
    filter: { mimeType: { startsWith: "image/" } },
  },
  {
    id: "documents",
    name: "Documents",
    filter: {
      OR: [
        { mimeType: "application/pdf" },
        { mimeType: { startsWith: "text/" } },
      ],
    },
  },
  {
    id: "other",
    name: "Other",
    filter: {
      NOT: {
        OR: [
          { mimeType: { startsWith: "image/" } },
          { mimeType: "application/pdf" },
          { mimeType: { startsWith: "text/" } },
        ],
      },
    },
  },
];

const categoryById = new Map(
  categoryDefinitions.map((category) => [category.id, category]),
);

export const fileCategories = categoryDefinitions.map(
  ({ filter: _filter, ...category }) => category,
);

export const getFileCategory = (id) => categoryById.get(id) ?? null;

export const getFileCategoryFilter = (id) =>
  categoryById.get(id)?.filter ?? null;

export const getFileCategoryId = (mimeType) => {
  if (mimeType.startsWith("image/")) return "photos";
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) {
    return "documents";
  }

  return "other";
};
