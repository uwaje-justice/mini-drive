import {
  FiFile,
  FiFileText,
  FiImage,
  FiType,
} from "react-icons/fi";

const fileMeta = {
  image: {
    icon: FiImage,
    tone: "bg-primary-container text-primary",
  },
  pdf: {
    icon: FiFileText,
    tone: "bg-error-container text-on-error-container",
  },
  text: {
    icon: FiType,
    tone: "bg-success-container text-on-success-container",
  },
  file: {
    icon: FiFile,
    tone: "bg-surface-container-high text-on-surface-variant",
  },
};

const getFileMeta = (previewKind) =>
  fileMeta[previewKind] ?? fileMeta.file;

export default getFileMeta;
