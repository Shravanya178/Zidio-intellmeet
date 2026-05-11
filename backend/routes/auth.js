const express = require("express");
const passport = require("passport");
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authController");
const { signAccessToken, signRefreshToken } = require("../utils/tokens");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get(
  "/google",
  passport.authenticate("google", { session: false, scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  (req, res) => {
    const user = req.user;
    const accessToken = signAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = signRefreshToken(
      user._id.toString(),
      user.tokenVersion
    );

    const days = Number.parseInt(process.env.REFRESH_COOKIE_DAYS || "7", 10);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: days * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }
);

router.get("/google/failure", (req, res) => {
  res.status(401).json({ message: "Google authentication failed" });
});

module.exports = router;
