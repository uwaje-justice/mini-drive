import { sendData } from "../responses.js";
import {
  serializeCategoryListing,
  serializeDriveOverview,
} from "../serializers.js";
import driveService from "../services/drive-service.js";

const overview = async (req, res) => {
  const data = await driveService.listOverview(req.user.id);

  return sendData(res, serializeDriveOverview(data));
};

const category = async (req, res) => {
  const data = await driveService.listCategory(
    req.user.id,
    req.params.category,
    { page: req.query.page },
  );

  return sendData(res, serializeCategoryListing(data));
};

export default { overview, category };
