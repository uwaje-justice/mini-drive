import { sendData } from "../responses.js";
import {
  serializeDrive,
  serializeFolder,
  serializeMoveTarget,
} from "../serializers.js";
import folderService from "../services/folder-service.js";

const pageQuery = (req) => ({
  page: req.query.page,
  folderPage: req.query.folderPage,
});

const index = async (req, res) => {
  const page = await folderService.listRoot(req.user.id, pageQuery(req));

  return sendData(res, serializeDrive(page));
};

const show = async (req, res) => {
  const page = await folderService.getContents(
    req.user.id,
    req.params.id,
    pageQuery(req),
  );

  return sendData(res, serializeDrive(page));
};

const create = async (req, res) => {
  const { name, parentId } = req.validated;
  const folder = await folderService.createFolder(req.user.id, {
    name,
    parentId: parentId || null,
  });

  return sendData(res, { folder: serializeFolder(folder) }, 201);
};

const rename = async (req, res) => {
  const folder = await folderService.renameFolder(
    req.user.id,
    req.params.id,
    { name: req.validated.name },
  );

  return sendData(res, { folder: serializeFolder(folder) });
};

const move = async (req, res) => {
  const { parentId } = req.validated;
  const folder = await folderService.moveFolder(req.user.id, req.params.id, {
    parentId: parentId || null,
  });

  return sendData(res, { folder: serializeFolder(folder) });
};

const moveTargets = async (req, res) => {
  await folderService.getFolder(req.user.id, req.params.id);

  const targets = await folderService.listMoveTargets(req.user.id, {
    excludeFolderId: req.params.id,
  });

  return sendData(res, { targets: targets.map(serializeMoveTarget) });
};

const remove = async (req, res) => {
  await folderService.deleteFolder(req.user.id, req.params.id);

  return res.status(204).end();
};

export default { index, show, create, rename, move, moveTargets, remove };
