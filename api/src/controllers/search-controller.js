import { sendData } from "../responses.js";
import { serializePagination, serializeSearchResult } from "../serializers.js";
import searchService from "../services/search-service.js";

const maxQueryLength = 100;

const index = async (req, res) => {
  const rawQuery = typeof req.query.q === "string" ? req.query.q : "";
  const query = rawQuery.trim().slice(0, maxQueryLength);
  const results = await searchService.searchDrive(req.user.id, query, {
    page: req.query.page,
  });

  return sendData(res, {
    query: results.query,
    results: results.results.map(serializeSearchResult),
    pagination: serializePagination(results.pagination),
  });
};

export default { index };
