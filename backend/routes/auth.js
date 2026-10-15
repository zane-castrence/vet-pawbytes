const router = require("express").Router();
const c = require("../controllers/auth");
router.post("/register", c.register);
router.post("/login", c.login);
router.post("/google", c.google);
module.exports = router;
