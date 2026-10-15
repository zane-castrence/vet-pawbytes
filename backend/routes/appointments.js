const router = require("express").Router();
const { requireAuth, requireRole, TEAM } = require("../middleware/auth");
const c = require("../controllers/appointments");
router.use(requireAuth);
// Declare /mine and /busy before /:id
router.get("/mine", c.mine);
router.get("/busy", c.busy);
router.get("/", requireRole(...TEAM), c.all);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);
module.exports = router;
