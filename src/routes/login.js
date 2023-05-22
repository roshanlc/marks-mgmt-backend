const { Router } = require("express")

const router = Router()
const Joi = require("joi")
const errorResponse = require("../helper/error")
const { compareHash } = require("../helper/password")
const { PrismaClient } = require("@prisma/client")
const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET

// prisma client
const db = new PrismaClient()

// Replace the '"' from the string
function escapeColon(msg) {
  return msg.replaceAll('"', "")
}

// schema for the login payload
const loginSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().trim().min(5).max(50),
})

// Login Endpoint
// Endpoint for user authentication
// Returns JWT token if successfull
// otherwise appropriate error response
router.post("/login", async function (req, res) {
  // validate the request body
  const err = loginSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { email, password } = req.body

  try {
    // try to find user from provided details
    const userDetails = await db.users.findFirst({
      where: {
        email: email,
      },
    })

    // incase user does not exist or invalid password is provided
    if (
      userDetails === null ||
      (userDetails !== null && !compareHash(password, userDetails.password))
    ) {
      res
        .status(401)
        .json(
          errorResponse(
            "Authentication Error",
            "Please provide valid login credentials."
          )
        )
      return
    }

    // generate token
    const token = generateToken(userDetails)
    // return response
    res.status(200).json(loginResponse(token, userDetails))
  } catch (err) {
    console.log(err) // TODO: replace with proper logger
    res
      .status(500)
      .json(errorResponse("Internal Server Error", "Something went wrong."))
  }
})

/**
 * Generates a jwt token based on user details (id, email and role)
 * @param {Object} user user details
 * @returns  jwt token
 */
function generateToken(user) {
  // uses the default algorithm:  (HMAC SHA256)
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "1d",
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
      id: userDetails.id,
      email: userDetails.email,
      role: userDetails.role,
    },
  }
}

module.exports = router
