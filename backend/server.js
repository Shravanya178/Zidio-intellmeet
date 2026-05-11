const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("dotenv").config();

const connectDB = require("./config/db");
const configurePassport = require("./config/passport");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const teamRoutes = require("./routes/teams");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
configurePassport();
app.use(passport.initialize());

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);

app.use(errorHandler);

// port
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();