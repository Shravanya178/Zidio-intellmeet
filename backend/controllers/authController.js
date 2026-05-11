const User = require("../models/User");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");

const getRefreshCookieOptions = () => {
  const days = Number.parseInt(process.env.REFRESH_COOKIE_DAYS || "7", 10);

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: days * 24 * 60 * 60 * 1000,
  };
};

const register = async (req, res, next) => {
  console.log("next type:", typeof next, next);
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.create({ email, password, name });

    const accessToken = signAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = signRefreshToken(
      user._id.toString(),
      user.tokenVersion
    );

    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = signRefreshToken(
      user._id.toString(),
      user.tokenVersion
    );

    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = signAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = signRefreshToken(
      user._id.toString(),
      user.tokenVersion
    );

    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const payload = verifyRefreshToken(token);
      await User.findByIdAndUpdate(payload.sub, {
        $inc: { tokenVersion: 1 },
      });
    }

    res.clearCookie("refreshToken", getRefreshCookieOptions());
    return res.json({ message: "Logged out" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
