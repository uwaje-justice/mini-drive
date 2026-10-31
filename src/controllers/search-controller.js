import searchService from "../services/search-service.js";

const MAX_QUERY_LENGTH = 100;

const index = async (req, res) => {
  const rawQuery = typeof req.query.q === "string" ? req.query.q : "";
  const query = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);
  const results = await searchService.searchDrive(req.user.id, query, {
    page: req.query.page,
  });

  return res.render("search/index", {
    searchQuery: results.query,
    results: results.results,
    pagination: results.pagination,
  });
};

export default { index };
