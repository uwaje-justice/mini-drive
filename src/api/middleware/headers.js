const apiHeaders = (req, res, next) => {
  res.set({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });

  next();
};

export default apiHeaders;
