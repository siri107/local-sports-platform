// Central place where any error thrown/passed to next() ends up. In
// development we surface the real message to speed up debugging; in
// production we keep the response generic so internal details (query
// shapes, file paths, stack traces) never reach the client.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  const isProduction = process.env.NODE_ENV === "production";
  const message =
    isProduction && statusCode === 500
      ? "Something went wrong on our end. Please try again shortly."
      : err.message || "Server error";

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
