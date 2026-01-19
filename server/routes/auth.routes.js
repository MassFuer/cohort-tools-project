const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const { isAuthenticated } = require("../middleware/jwt.middlewares");

// Rate limiter for signup: 5 requests per hour per IP
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 signup requests per windowMs
  message: "Too many signup attempts from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for login: 10 requests per hour per IP
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: "Too many login attempts from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/signup - User registration
router.post("/signup", signupLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errorMessage: "Email already in use" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });
      res.status(201).json({ message: "User created successfully", newUser });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

// POST /api/auth/login - User login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ errorMessage: "Invalid email or password" });
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ errorMessage: "Invalid email or password" });
      } else {
        const authToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          {
            algorithm: "HS256",
            expiresIn: "6h",
          },
        );
        res.status(200).json({
          message: "Congrats u're logged in",
          authToken: authToken,
          userId: user._id,
        });
      }
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

// GET /api/auth/verify - Verify JWT token
router.get("/verify", isAuthenticated, async (req, res) => {
  const currentLoggedUser = await User.findById(req.payload.userId).select(
    "-password",
  );
  res.status(200).json({ message: "Token is valid", currentLoggedUser });
});
module.exports = router;
