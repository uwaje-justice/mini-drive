export const pageSize = 20;

export const parsePage = (value, fallback = 1) => {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : fallback;
};

export const buildPagination = ({ page, total, size = pageSize }) => {
  const totalPages = Math.ceil(total / size);
  const currentPage = Math.min(parsePage(page), Math.max(1, totalPages));

  return {
    page: currentPage,
    pageSize: size,
    total,
    totalPages,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
    offset: (currentPage - 1) * size,
  };
};

export default { pageSize, parsePage, buildPagination };
