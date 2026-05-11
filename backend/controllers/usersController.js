const User = require("../models/User");

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "email name role avatarUrl bio"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const updates = {};
    const allowedFields = ["name", "avatarUrl", "bio"];

    allowedFields.forEach((field) => {
      if (req.body?.[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      select: "email name role avatarUrl bio",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      {
        new: true,
        runValidators: true,
        select: "email name role avatarUrl bio",
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  updateRole,
};
