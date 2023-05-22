const jwt = require("jsonwebtoken")
const errorResponse = require("../helper/error")
const JWT_SECRET = process.env.JWT_SECRET

/**
 * Middleware for verify the validity of bearer token
 * @param {*} req Request
 * @param {*} res Response
 * @param {*} next Next function to pass the request onto
 * @returns
 */
// Authorization middleware
// Checks if request contain auth header
// and whether the bearer token is valid
function authHandler(req, res, next) {
  // Check for `Authorization` header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json(errorResponse("Unauthorized", "Missing or invalid bearer token."))
    return
  }

  const token = authHeader.substring(7, authHeader.length)
  try {
    // check for jwt validity
    jwt.verify(token, JWT_SECRET)
  } catch (err) {
    res
      .status(401)
      .json(errorResponse("Unauthorized", "Missing or invalid bearer token."))
    return
  }

  // Pass the request to next handler
  next()
}

module.exports = authHandler
