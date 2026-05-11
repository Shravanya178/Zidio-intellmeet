const jwt = require("jsonwebtoken");

const signAccessToken = (user) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not set");
  }

  const expiresIn = process.env.ACCESS_TOKEN_TTL || "15m";
  return jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn });
};

const signRefreshToken = (userId, tokenVersion) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }

  const expiresIn = process.env.REFRESH_TOKEN_TTL || "7d";
  return jwt.sign({ sub: userId, tokenVersion }, secret, { expiresIn });
};

const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }

  return jwt.verify(token, secret);
};

const verifyAccessToken = (token) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not set");
  }

  return jwt.verify(token, secret);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};
