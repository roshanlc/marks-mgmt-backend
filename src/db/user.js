// Db actions related to user model
const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const { toResult } = require("../helper/result")
const { errorResponse, internalServerError } = require("../helper/error")
const logger = require("../helper/logger")
const { compareHash } = require("../helper/password")
const { authenticationError, NotFoundError } = require("../helper/error")

/**
 * Get user details
 * @param {Number} userId
 */
async function getUserDetails(userId) {
  try {
    const userDetails = await db.user.findFirstOrThrow({
      where: {
        id: userId,
      },
      include: {
        UserRoles: {
          select: {
            role: true,
          },
        },
      },
    })

    // delete password field
    if (userDetails.password) {
      delete userDetails.password
    }
    // return user details
    return toResult(userDetails, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "Please provide valid user id.")
      )
    } else {
      logger.warn(`getUserDetails(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Checks if given email exists in user system
 * and returns corresponding result
 *
 * @param {String} email - email of user
 * @param {String} password - plain text password
 * @returns result response which contains result and error response
 */
async function checkLogin(email, password) {
  try {
    // try to find user by id
    const userDetails = await db.user.findFirstOrThrow({
      where: {
        email: email,
      },
    })

    // check if password matches
    if (
      userDetails === null ||
      (userDetails !== null && !compareHash(password, userDetails.password))
    ) {
      return toResult(null, authenticationError())
    }

    // return user details by id
    return await getUserDetails(userDetails.id)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(null, authenticationError())
    } else {
      logger.warn(`checkLogin(): ${err.message}`)
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Returns student id from user id
 * @param {Number} userId - user id
 * @returns student id of auser
 */
async function getStudentId(userId) {
  try {
    // try to find user by id
    const studentId = await db.student.findFirstOrThrow({
      where: { userId: userId },
      select: { id: true },
    })
    // return user details by id
    return toResult(studentId, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(null, NotFoundError(err.message))
    } else {
      logger.warn(`getStudentId(): ${err.message}`)
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Returns teacher id from user id
 * @param {Number} userId - user id
 * @returns teacher id of a user
 */
async function getTeacherId(userId) {
  try {
    // try to find user by id
    const studentId = await db.student.findFirstOrThrow({
      where: {
        user: { id: userId },
      },
      select: { id: true },
    })

    // return user details by id
    return toResult(studentId, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(null, NotFoundError(err.message))
    } else {
      logger.warn(`getStudentId(): ${err.message}`)
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Returns admin id from user id
 * @param {Number} userId - user id
 * @returns admin id of a user
 */
async function getAdminId(userId) {
  try {
    // try to find user by id
    const studentId = await db.admin.findFirstOrThrow({
      where: {
        userId: userId,
      },
      select: { id: true },
    })

    // return user details by id
    return toResult(studentId, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(null, NotFoundError(err.message))
    } else {
      logger.warn(`getStudentId(): ${err.message}`)
      return toResult(null, internalServerError())
    }
  }
}
module.exports = {
  checkLogin,
  getUserDetails,
  getAdminId,
  getStudentId,
  getTeacherId,
}
