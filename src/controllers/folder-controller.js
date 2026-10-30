import folderService from "../services/folder-service.js";
import ConflictError from "../errors/conflict-error.js";

const index = async (req, res) => {
  const { folders, files } = await folderService.listRoot(req.user.id);

  return res.render("folders/index", { folders, files });
};

const show = async (req, res) => {
  const { folder, folders, files } = await folderService.getContents(
    req.user.id,
    req.params.id,
  );

  return res.render("folders/show", { folder, folders, files });
};

const newForm = (req, res) => {
  const parentId =
    typeof req.query.parentId === "string" ? req.query.parentId : "";

  return res.render("folders/new", { errors: {}, values: { parentId } });
};

const create = async (req, res, next) => {
  const { name, parentId } = req.matchedData;

  try {
    const folder = await folderService.createFolder(req.user.id, {
      name,
      parentId: parentId || null,
    });
    const target = folder.parentId ? `/folders/${folder.parentId}` : "/folders";

    return res.redirect(target);
  } catch (error) {
    if (error instanceof ConflictError) {
      return res.status(409).render("folders/new", {
        errors: { name: error.message },
        values: { name, parentId },
      });
    }

    return next(error);
  }
};

const editForm = async (req, res) => {
  const folder = await folderService.getFolder(req.user.id, req.params.id);

  return res.render("folders/edit", {
    errors: {},
    values: { name: folder.name },
  });
};

const update = async (req, res, next) => {
  const { name } = req.matchedData;

  try {
    const folder = await folderService.renameFolder(req.user.id, req.params.id, {
      name,
    });

    return res.redirect(`/folders/${folder.id}`);
  } catch (error) {
    if (error instanceof ConflictError) {
      return res.status(409).render("folders/edit", {
        errors: { name: error.message },
        values: { name },
      });
    }

    return next(error);
  }
};

const remove = async (req, res) => {
  const folder = await folderService.deleteFolder(req.user.id, req.params.id);
  const target = folder.parentId ? `/folders/${folder.parentId}` : "/folders";

  return res.redirect(target);
};

export default { index, show, newForm, create, editForm, update, remove };
