import fileService from "../services/file-service.js";
import folderService from "../services/folder-service.js";
import ConflictError from "../errors/conflict-error.js";

const renderFolder = async (req, res, { folderId, message }) => {
  if (folderId) {
    const { folder, folders, files } = await folderService.getContents(
      req.user.id,
      folderId,
    );

    return res.status(409).render("folders/show", {
      folder,
      folders,
      files,
      uploadError: message,
    });
  }

  const { folders, files } = await folderService.listRoot(req.user.id);

  return res.status(409).render("folders/index", {
    folders,
    files,
    uploadError: message,
  });
};

const upload = async (req, res, next) => {
  const folderId =
    typeof req.body.folderId === "string" ? req.body.folderId : null;

  try {
    await fileService.createFile({
      ownerId: req.user.id,
      folderId,
      file: req.file,
    });

    return res.redirect(folderId ? `/folders/${folderId}` : "/folders");
  } catch (error) {
    if (error instanceof ConflictError) {
      return renderFolder(req, res, { folderId, message: error.message });
    }

    return next(error);
  }
};

export default { upload };
