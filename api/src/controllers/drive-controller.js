import { parseActivityFilters } from "../lib/activity-filters.js";
import { sendData } from "../responses.js";
import {
  serializeActivityListing,
  serializeCategoryListing,
  serializeDriveOverview,
} from "../serializers.js";
import driveService from "../services/drive-service.js";

const overview = async (req, res) => {
  const data = await driveService.listOverview(req.user.id);

  return sendData(res, serializeDriveOverview(data));
};

const activity = async (req, res) => {
  const data = await driveService.listActivity(req.user.id, {
    page: req.query.page,
    ...parseActivityFilters(req.query),
  });

  return sendData(res, serializeActivityListing(data));
};

const removeActivity = async (req, res) => {
  await driveService.removeActivity(req.user.id, req.params.id);

  return res.status(204).end();
};

const clearActivity = async (req, res) => {
  await driveService.clearActivity(req.user.id);

  return res.status(204).end();
};

const category = async (req, res) => {
  const data = await driveService.listCategory(
    req.user.id,
    req.params.category,
    { page: req.query.page },
  );

  return sendData(res, serializeCategoryListing(data));
};

export default {
  overview,
  category,
  activity,
  removeActivity,
  clearActivity,
};
