module.exports = (err, _req, res, _next) => {
  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Image must be 5 MB or smaller."
    });
  }

  if (err.name === "MulterError" && err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      message: "Use the image field for the uploaded file."
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "That value already exists."
    });
  }

  if (err.name === "CastError") {
    return res.status(404).json({
      message: "Not found."
    });
  }

  if (!err.status) {
    console.error(err);
  }

  res.status(err.status || 500).json({
    message: err.status
      ? err.message
      : "Something went wrong on the server."
  });
};