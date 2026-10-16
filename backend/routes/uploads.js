const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const c = require("../controllers/uploads");

router.use(requireAuth);

router.post("/image", upload.single("image"), c.uploadImage);

module.exports = router;