export const readPageParam = (value) => {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
};
