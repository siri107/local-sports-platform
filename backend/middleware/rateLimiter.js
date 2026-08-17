const rateLimit = require("express-rate-limit");

// Login/register are the only unauthenticated write endpoints in the app,
// which makes them the obvious target for brute-force or spam-account
// attempts. Capping requests per IP here is cheap insurance.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many attempts from this device. Please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// A looser general limiter for the rest of the API, mainly to blunt
// scripted abuse rather than to constrain normal browsing.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests. Please slow down and try again shortly." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
