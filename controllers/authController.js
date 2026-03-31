const User = require("../models/User");
const jwt = require("jsonwebtoken");

const handleErrors = (err) => {
  console.error("❌ Auth error:", err.message, err.code || "");
  let errors = {};

  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
    return errors;
  }

  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
    return errors;
  }

  if (err.code === 11000) {
    if (err.keyPattern && err.keyPattern.username) {
      errors.username = "That username is already taken";
    } else if (err.keyPattern && err.keyPattern.email) {
      errors.email = "That email is already registered";
    } else if (err.message.includes('username')) {
      errors.username = "That username is already taken";
    } else {
      errors.email = "That email is already registered";
    }
    return errors;
  }

  if (err.message && err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
    return errors;
  }

  // Catch-all: return the actual error message so it's visible in the UI
  errors.general = err.message || "An unexpected error occurred";
  return errors;
};

const maxAge = 3 * 24 * 60 * 60; // 3 days
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production";

const createToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: maxAge,
  });
};

// Helper to get correct cookie config based on environment
const getCookieOptions = () => ({
  httpOnly: true,
  maxAge: maxAge * 1000,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  secure: process.env.NODE_ENV === "production", // true for HTTPS/Vercel
});

// GET signup (not used in API, kept for reference)
module.exports.signup_get = (req, res) => {
  res.render("signup");
};

// GET login (not used in API, kept for reference)
module.exports.login_get = (req, res) => {
  res.render("login");
};

// POST signup
module.exports.signup_post = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({ username, email, password });
    const token = createToken(user._id, user.role);

    res.cookie("jwt", token, getCookieOptions());

    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

// POST login
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id, user.role);

    res.cookie("jwt", token, getCookieOptions());

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

// GET logout
module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 1,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
};

// GET /api/auth/me
module.exports.me_get = async (req, res) => {
  let token = req.cookies.jwt;

  // ✅ Support Vercel’s _vercel_jwt if jwt is missing
  if (!token && req.cookies._vercel_jwt) {
    token = req.cookies._vercel_jwt;
  }

  if (!token) return res.status(200).json({ user: null });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(200).json({ user: null });

    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ Error decoding token:", err);
    res.status(200).json({ user: null });
  }
};
