const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const c = require("../controllers/archive");
router.use(requireAuth);
router.get("/", c.list);
router.put("/appointments/:id", c.setAppointment);
router.put("/pets/:id", c.setPet);
module.exports = router;
