import {
  FiArchive,
  FiFileText,
  FiImage,
  FiType,
} from "react-icons/fi";

const categoryMeta = {
  photos: {
    icon: FiImage,
    tone: "bg-primary-container text-primary",
  },
  documents: {
    icon: FiFileText,
    tone: "bg-warning-container text-on-warning-container",
  },
  text: {
    icon: FiType,
    tone: "bg-success-container text-on-success-container",
  },
  other: {
    icon: FiArchive,
    tone: "bg-surface-container-high text-on-surface-variant",
  },
};

const getCategoryMeta = (categoryId) =>
  categoryMeta[categoryId] ?? categoryMeta.other;

export default getCategoryMeta;
