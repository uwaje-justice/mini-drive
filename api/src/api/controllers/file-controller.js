import BadRequestError from "../../errors/bad-request-error.js";
import PayloadTooLargeError from "../../errors/payload-too-large-error.js";
import UnsupportedMediaTypeError from "../../errors/unsupported-media-type-error.js";
import isPreviewable from "../../lib/preview.js";
import sendFile from "../../lib/send-file.js";
import fileService from "../../services/file-service.js";
import folderService from "../../services/folder-service.js";
import { sendData } from "../responses.js";
import { serializeFile, serializeMoveTarget } from "../serializers.js";

const uploadFailure = (error) => {
  if (error.statusCode === 413) return new PayloadTooLargeError(error.message);

  if (error.statusCode === 415) {
    return new UnsupportedMediaTypeError(error.message);
  }

  return new BadRequestError(error.message);
};

const upload = async (req, res, next) => {
  try {
    if (req.uploadError) throw uploadFailure(req.uploadError);

    const folderId =
      typeof req.body?.folderId === "string" && req.body.folderId
        ? req.body.folderId
        : null;
    const skipped = req.uploadErrors ?? [];

    if (!req.files?.length && skipped.length === 0) {
      throw new BadRequestError("Choose a file to upload.");
    }

    if (!req.files?.length) {
      return sendData(
        res,
        {
          uploaded: [],
          skipped: skipped.map((error) => ({ message: error.message })),
        },
        207,
      );
    }

    const { created, errors } = await fileService.createFiles({
      ownerId: req.user.id,
      folderId,
      files: req.files,
    });
    const allSkipped = [...skipped, ...errors];

    return sendData(
      res,
      {
        uploaded: created.map(serializeFile),
        skipped: allSkipped.map((error) => ({ message: error.message })),
      },
      allSkipped.length > 0 ? 207 : 201,
    );
  } catch (error) {
    return next(error);
  }
};

const show = async (req, res) => {
  const file = await fileService.getFile(req.user.id, req.params.id);

  return sendData(res, { file: serializeFile(file) });
};

const rename = async (req, res) => {
  const file = await fileService.renameFile(req.user.id, req.params.id, {
    name: req.matchedData.name,
  });

  return sendData(res, { file: serializeFile(file) });
};

const move = async (req, res) => {
  const { folderId } = req.matchedData;
  const file = await fileService.moveFile(req.user.id, req.params.id, {
    folderId: folderId || null,
  });

  return sendData(res, { file: serializeFile(file) });
};

const moveTargets = async (req, res) => {
  await fileService.getFile(req.user.id, req.params.id);

  const targets = await folderService.listMoveTargets(req.user.id);

  return sendData(res, { targets: targets.map(serializeMoveTarget) });
};

const remove = async (req, res) => {
  await fileService.deleteFile(req.user.id, req.params.id);

  return res.status(204).end();
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

export default {
  upload,
  show,
  rename,
  move,
  moveTargets,
  remove,
  download,
  preview,
};
