import BadRequestError from "../errors/bad-request-error.js";
import isPreviewable from "../lib/preview.js";
import sendFile from "../lib/send-file.js";
import { sendData } from "../responses.js";
import {
  serializeDrive,
  serializeFolder,
  serializeShare,
  serializeShareLink,
} from "../serializers.js";
import shareService from "../services/share-service.js";

const index = async (req, res) => {
  const { folder, links } = await shareService.getSharePage(
    req.user.id,
    req.params.id,
  );

  return sendData(res, {
    folder: serializeFolder(folder),
    links: links.map(serializeShareLink),
  });
};

const create = async (req, res) => {
  const link = await shareService.createShareLink(
    req.user.id,
    req.params.id,
    req.matchedData.days,
  );

  return sendData(res, { link: serializeShareLink(link) }, 201);
};

const revoke = async (req, res) => {
  await shareService.revokeShareLink(
    req.user.id,
    req.params.id,
    req.params.shareId,
  );

  return res.status(204).end();
};

const showPublic = async (req, res) => {
  const page = await shareService.getSharedContents(
    req.params.token,
    req.params.folderId,
    {
      page: req.query.page,
      folderPage: req.query.folderPage,
    },
  );

  return sendData(res, {
    share: serializeShare(page.share),
    ...serializeDrive(page),
  });
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
  index,
  create,
  revoke,
  showPublic,
  downloadPublicFile,
  previewPublicFile,
};
