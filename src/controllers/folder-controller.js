import folderService from "../services/folder-service.js";
import ConflictError from "../errors/conflict-error.js";
import BadRequestError from "../errors/bad-request-error.js";

const index = async (req, res) => {
  const page = await folderService.listRoot(req.user.id, {
    page: req.query.page,
    folderPage: req.query.folderPage,
  });

  return res.render("folders/index", page);
};

const show = async (req, res) => {
  const page = await folderService.getContents(req.user.id, req.params.id, {
    page: req.query.page,
    folderPage: req.query.folderPage,
  });

  return res.render("folders/show", page);
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

const loadEditPage = async (req) => {
  const folder = await folderService.getFolder(req.user.id, req.params.id);

  return {
    folder,
    errors: {},
    values: { name: folder.name },
  };
};

const editForm = async (req, res) => {
  return res.render("folders/edit", await loadEditPage(req));
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
      const page = await loadEditPage(req);

      return res.status(409).render("folders/edit", {
        ...page,
        errors: { name: error.message },
        values: { name },
      });
    }

    return next(error);
  }
};

const loadMovePage = async (req) => {
  const folder = await folderService.getFolder(req.user.id, req.params.id);
  const targets = await folderService.listMoveTargets(req.user.id, {
    excludeFolderId: folder.id,
  });

  return {
    folder,
    targets,
    errors: {},
    values: { parentId: folder.parentId ?? "" },
  };
};

const moveForm = async (req, res) => {
  return res.render("folders/move", await loadMovePage(req));
};

const move = async (req, res, next) => {
  const { parentId } = req.matchedData;

  try {
    const folder = await folderService.moveFolder(req.user.id, req.params.id, {
      parentId: parentId || null,
    });
    const target = folder.parentId ? `/folders/${folder.parentId}` : "/folders";

    return res.redirect(target);
  } catch (error) {
    if (error instanceof ConflictError || error instanceof BadRequestError) {
      const page = await loadMovePage(req);

      return res.status(error.statusCode).render("folders/move", {
        ...page,
        errors: { parentId: error.message },
        values: { parentId: parentId ?? "" },
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

export default {
  index,
  show,
  newForm,
  create,
  loadEditPage,
  editForm,
  update,
  loadMovePage,
  moveForm,
  move,
  remove,
};
