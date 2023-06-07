const jwt = require("jsonwebtoken")

/**
 * Returns decoded details about a jwt bearer token
 * @param {Request} req
 * @returns details decoded from jwt bearer token
 */
function extractTokenDetails(req) {
  const authHeader = req.headers.authorization
  return jwt.decode(authHeader.substring(7, authHeader.length))
}

module.exports = { extractTokenDetails }
