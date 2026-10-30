import fileService from "../services/file-service.js";
import folderService from "../services/folder-service.js";
import sendFile from "../lib/send-file.js";
import ConflictError from "../errors/conflict-error.js";

const renderFolder = async (
  req,
  res,
  { folderId, message, statusCode = 409 },
) => {
  if (folderId) {
    const { folder, folders, files } = await folderService.getContents(
      req.user.id,
      folderId,
    );

    return res.status(statusCode).render("folders/show", {
      folder,
      folders,
      files,
      uploadError: message,
    });
  }

  const { folders, files } = await folderService.listRoot(req.user.id);

  return res.status(statusCode).render("folders/index", {
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

const show = async (req, res) => {
  const file = await fileService.getFile(req.user.id, req.params.id);

  return res.render("files/show", { file });
};

const download = async (req, res, next) => {
  try {
    const file = await fileService.getFile(req.user.id, req.params.id);
    await sendFile(res, file);
  } catch (error) {
    if (res.headersSent) return console.error(error);

    return next(error);
  }
};

const remove = async (req, res) => {
  const file = await fileService.deleteFile(req.user.id, req.params.id);
  const target = file.folderId ? `/folders/${file.folderId}` : "/folders";

  return res.redirect(target);
};

export default { upload, show, download, remove };
