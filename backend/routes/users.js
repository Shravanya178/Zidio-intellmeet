const express = require("express");
const protect = require("../middleware/auth");
const authorizeRoles = require("../middleware/roles");
const {
  getMe,
  updateMe,
  updateRole,
} = require("../controllers/usersController");

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/:userId/role", protect, authorizeRoles("admin"), updateRole);

module.exports = router;
