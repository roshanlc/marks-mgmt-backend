const { Router } = require("express")
const router = Router()
const jwt = require("jsonwebtoken")
const logger = require("../../helper/logger")
const { internalServerError } = require("../../helper/error")

// Token Validation Endpoint
// Endpoint for user token validation
// Returns the same JWT token if valid
// otherwise appropriate error response
router.post("/validate", async function (req, res) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader.substring(7, authHeader.length)
    const decodedToken = jwt.decode(token)
    // return response
    return res.status(200).json(decodedToken)
  } catch (err) {
    logger.warn(err.message)
    res.status(500).json(internalServerError("Something went wrong."))
    return
  }
})

module.exports = router
