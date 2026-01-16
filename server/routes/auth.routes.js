const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { isAuthenticated } = require("../middleware/jwt.middlewares");

// POST /api/auth/signup - User registration
router.post("/signup", async (req, res) => {
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
router.post("/login", async (req, res) => {
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
        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        res
          .status(200)
          .json({
            message: "Congrats u're logged in",
            token: authToken,
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
router.get("/verify", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "Token is valid", payload: req.payload });
});
module.exports = router;
