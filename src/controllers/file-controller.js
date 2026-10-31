import fileService from "../services/file-service.js";
import folderService from "../services/folder-service.js";
import sendFile from "../lib/send-file.js";
import isPreviewable from "../lib/preview.js";
import ConflictError from "../errors/conflict-error.js";
import BadRequestError from "../errors/bad-request-error.js";

const renderFolder = async (
  req,
  res,
  { folderId, messages, statusCode = 400 },
) => {
  const query = { page: req.query.page, folderPage: req.query.folderPage };

  if (folderId) {
    const page = await folderService.getContents(req.user.id, folderId, query);

    return res.status(statusCode).render("folders/show", {
      ...page,
      uploadErrors: messages,
    });
  }

  const page = await folderService.listRoot(req.user.id, query);

  return res.status(statusCode).render("folders/index", {
    ...page,
    uploadErrors: messages,
  });
};

const errorStatus = (errors) =>
  errors.length === 1 ? errors[0].statusCode : 400;

const upload = async (req, res, next) => {
  const folderId =
    typeof req.body?.folderId === "string" ? req.body.folderId : null;

  if (req.uploadError) {
    return renderFolder(req, res, {
      folderId,
      messages: [req.uploadError.message],
      statusCode: req.uploadError.statusCode,
    });
  }

  const skipped = req.uploadErrors ?? [];

  if (req.files.length === 0) {
    return renderFolder(req, res, {
      folderId,
      messages: skipped.map((error) => error.message),
      statusCode: errorStatus(skipped),
    });
  }

  try {
    const { errors } = await fileService.createFiles({
      ownerId: req.user.id,
      folderId,
      files: req.files,
    });
    const uploadErrors = [...skipped, ...errors];

    if (uploadErrors.length > 0) {
      return renderFolder(req, res, {
        folderId,
        messages: uploadErrors.map((error) => error.message),
        statusCode: errorStatus(uploadErrors),
      });
    }

    return res.redirect(folderId ? `/folders/${folderId}` : "/folders");
  } catch (error) {
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

const preview = async (req, res, next) => {
  try {
    const file = await fileService.getFile(req.user.id, req.params.id);

    if (!isPreviewable(file.mimeType)) {
      throw new BadRequestError("This file type cannot be previewed.");
    }

    await sendFile(res, file, { inline: true });
  } catch (error) {
    if (res.headersSent) return console.error(error);

    return next(error);
  }
};

const loadEditPage = async (req) => {
  const file = await fileService.getFile(req.user.id, req.params.id);
  const targets = await folderService.listMoveTargets(req.user.id);

  return {
    file,
    targets,
    errors: {},
    values: { name: file.name, folderId: file.folderId ?? "" },
  };
};

const editForm = async (req, res) => {
  return res.render("files/edit", await loadEditPage(req));
};

const rename = async (req, res, next) => {
  const { name } = req.matchedData;

  try {
    const file = await fileService.renameFile(req.user.id, req.params.id, {
      name,
    });

    return res.redirect(`/files/${file.id}`);
  } catch (error) {
    if (error instanceof ConflictError) {
      const page = await loadEditPage(req);

      return res.status(409).render("files/edit", {
        ...page,
        errors: { name: error.message },
        values: { name, folderId: page.values.folderId },
      });
    }

    return next(error);
  }
};

const move = async (req, res, next) => {
  const { folderId } = req.matchedData;

  try {
    const file = await fileService.moveFile(req.user.id, req.params.id, {
      folderId: folderId || null,
    });
    const target = file.folderId ? `/folders/${file.folderId}` : "/folders";

    return res.redirect(target);
  } catch (error) {
    if (error instanceof ConflictError) {
      const page = await loadEditPage(req);

      return res.status(409).render("files/edit", {
        ...page,
        errors: { folderId: error.message },
        values: { name: page.values.name, folderId: folderId ?? "" },
      });
    }

    return next(error);
  }
};

const remove = async (req, res) => {
  const file = await fileService.deleteFile(req.user.id, req.params.id);
  const target = file.folderId ? `/folders/${file.folderId}` : "/folders";

  return res.redirect(target);
};

export default {
  upload,
  show,
  download,
  preview,
  loadEditPage,
  editForm,
  rename,
  move,
  remove,
};
