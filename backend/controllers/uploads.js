const cloudinary = require("../config/cloudinary");
const { fail } = require("../utils/httpError");

const uploadBuffer = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "pawbytes",
      resource_type: "image"
    },
    (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }
  );

  stream.end(buffer);
});

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    fail("Please choose an image to upload.");
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    fail("Image storage is not configured on the server.", 500);
  }

  const result = await uploadBuffer(req.file.buffer);

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes
  });
};