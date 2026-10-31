import shareService from "../services/share-service.js";
import sendFile from "../lib/send-file.js";
import isPreviewable from "../lib/preview.js";
import BadRequestError from "../errors/bad-request-error.js";

const requestOrigin = (req) => `${req.protocol}://${req.get("host")}`;

const loadSharePage = async (req) => {
  const { folder, links } = await shareService.getSharePage(
    req.user.id,
    req.params.id,
  );

  return { folder, links, origin: requestOrigin(req) };
};

const show = async (req, res) => {
  const page = await loadSharePage(req);

  return res.render("folders/share", {
    ...page,
    errors: {},
    values: { days: 7 },
  });
};

const create = async (req, res) => {
  await shareService.createShareLink(
    req.user.id,
    req.params.id,
    req.matchedData.days,
  );

  return res.redirect(`/folders/${req.params.id}/share`);
};

const revoke = async (req, res) => {
  await shareService.revokeShareLink(
    req.user.id,
    req.params.id,
    req.params.shareId,
  );

  return res.redirect(`/folders/${req.params.id}/share`);
};

const showPublicFolder = async (req, res) => {
  const page = await shareService.getSharedContents(
    req.params.token,
    req.params.folderId,
    { page: req.query.page, folderPage: req.query.folderPage },
  );

  return res.render("share/show", page);
};

const downloadPublicFile = async (req, res, next) => {
  try {
    const file = await shareService.getSharedFile(
      req.params.token,
      req.params.fileId,
    );
    await sendFile(res, file);
  } catch (error) {
    if (res.headersSent) return console.error(error);

    return next(error);
  }
};

const previewPublicFile = async (req, res, next) => {
  try {
    const file = await shareService.getSharedFile(
      req.params.token,
      req.params.fileId,
    );

    if (!isPreviewable(file.mimeType)) {
      throw new BadRequestError("This file type cannot be previewed.");
    }

    await sendFile(res, file, { inline: true });
  } catch (error) {
    if (res.headersSent) return console.error(error);

    return next(error);
  }
};

export default {
  show,
  loadSharePage,
  create,
  revoke,
  showPublicFolder,
  downloadPublicFile,
  previewPublicFile,
};
