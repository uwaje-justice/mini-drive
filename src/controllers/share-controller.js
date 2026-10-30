import shareService from "../services/share-service.js";
import sendFile from "../lib/send-file.js";

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
  const { share, folder, folders, files } = await shareService.getSharedContents(
    req.params.token,
    req.params.folderId,
  );

  return res.render("share/show", { share, folder, folders, files });
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

export default {
  show,
  loadSharePage,
  create,
  revoke,
  showPublicFolder,
  downloadPublicFile,
};
