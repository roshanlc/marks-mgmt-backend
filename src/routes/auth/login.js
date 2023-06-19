const { Router } = require("express")

const router = Router()
const Joi = require("joi")
const { errorResponse, responseStatusCode } = require("../../helper/error")
const jwt = require("jsonwebtoken")
const { checkLogin, changePassword } = require("../../db/users/user")
const { escapeColon } = require("../../helper/utils")
const { extractTokenDetails } = require("../../helper/extract-token")

const JWT_SECRET = process.env.JWT_SECRET

// schema for the login payload
const loginSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().trim().min(5).max(50),
})

// Login Endpoint
// Endpoint for user authentication
// Returns JWT token if successfull
// otherwise appropriate error response
router.post("", async function (req, res) {
  // validate the request body
  const err = loginSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { email, password } = req.body

  const userDetails = await checkLogin(email, password)
  if (userDetails.err !== null) {
    res
      .status(responseStatusCode.get(userDetails.err.error.title) || 500)
      .json(userDetails.err)
    return
  }

  const user = userDetails.result

  // check for expired or inactive account
  if (user.expired) {
    res
      .status(401)
      .json(
        errorResponse(
          "Expired Account",
          "The account has expired. Please contact administrator for more details."
        )
      )
    return
  } else if (user.inactive) {
    res
      .status(401)
      .json(
        errorResponse("Inactive Account", "The account has not been activated.")
      )
    return
  }

  // generate token from user details
  const token = generateToken(user)

  // return response
  res.status(200).json(loginResponse(token, user))
  return
})

// schema for the password change payload
const resetSchema = Joi.object({
  newPassword: Joi.string().trim().min(5).max(50),
})

// change Password Endpoint
router.post("/change", async function (req, res) {
  // validate the request body
  const err = resetSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // get token details
  const tokenDetails = extractTokenDetails(req)

  const pwChange = await changePassword(tokenDetails.id, req.body.newPassword)

  if (pwChange.err !== null) {
    res
      .status(responseStatusCode.get(pwChange.err.error.title) || 400)
      .json(pwChange.err)
    return
  }
  // return response
  res.status(200).json({ msg: "Password Change successfull" })
  return
})

/**
 * Generates a jwt token based on user details (id, email and role)
 * @param {Object} user user details
 * @returns  jwt token
 */
function generateToken(user) {
  // uses the default algorithm:  (HMAC SHA256)
  const token = jwt.sign(
    { id: user.id, email: user.email, UserRoles: user.UserRoles },
    JWT_SECRET,
    {
      expiresIn: "10d",
    }
  )

  return token
}

/**
 * Generate a login response based on token and user details
 * @param {String} token jwt token
 * @param {Object} userDetails  user details
 * @returns a login response
 */
function loginResponse(token, userDetails) {
  // extract issued_at and expries_at from decoded token
  const { iat, exp } = jwt.decode(token)
  return {
    token: token,
    iat: iat,
    exp: exp,
    user: {
      ...userDetails,
    },
  }
}

module.exports = router
