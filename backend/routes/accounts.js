const router = require("express").Router();
const { requireAuth, requireRole, TEAM } = require("../middleware/auth");
const c = require("../controllers/accounts");
router.use(requireAuth);
// Declare /team/... before /:id
router.get("/team/availability", c.teamAvailability);
router.put("/team/:id/availability", c.setAvailability);
router.post("/team", requireRole("admin"), c.createTeam);
router.get("/", requireRole(...TEAM), c.list);
router.put("/:id/active", requireRole("admin"), c.setActive);
router.put("/:id/role", requireRole("admin"), c.setRole);
router.delete("/:id", requireRole("admin"), c.remove);
module.exports = router;
