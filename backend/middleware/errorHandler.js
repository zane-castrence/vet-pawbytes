module.exports = (err, _req, res, _next) => {
  if (err.name === "CastError") return res.status(404).json({ message: "Not found." });
  if (err.code === 11000) return res.status(409).json({ message: "That value already exists." });
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : "Something went wrong on the server." });
};
