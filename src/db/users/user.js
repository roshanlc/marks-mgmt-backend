// Db actions related to user model
const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const { toResult } = require("../../helper/result")
const {
  errorResponse,
  internalServerError,
  badRequestError,
} = require("../../helper/error")
const logger = require("../../helper/logger")
const { compareHash, hashPassword } = require("../../helper/password")
const { authenticationError, NotFoundError } = require("../../helper/error")
const { assignRoleToUser } = require("./roles")

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
    const studentId = await db.teacher.findFirstOrThrow({
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
      logger.warn(`getTeacherId(): ${err.message}`)
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
      logger.warn(`getAdmin(): ${err.message}`)
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Add a new user to user table
 * @param {String} email
 * @param {String} password - Password hash from bcrypt
 * @param {String} name
 * @param {String} address
 * @param {String} contactNo
 * @param {Boolean} activated
 * @param {Boolean} expired
 * @returns
 */
async function addUser(
  email,
  password,
  name,
  address = "",
  contactNo = "",
  activated = true,
  expired = false
) {
  try {
    // check for invalid input
    if (
      email === "" ||
      password === "" ||
      name === "" ||
      email === null ||
      password === null ||
      name === null
    ) {
      return toResult(
        null,
        badRequestError("email, password and name should not be empty.")
      )
    }

    const user = await db.user.create({
      data: {
        email: email,
        password: password,
        name: name,
        address: address,
        contactNo: contactNo,
        activated: activated,
        expired: expired,
      },
    })

    // valid user creation operation
    return toResult(user, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. Please update method to update the resource.`
        )
      )
    } else {
      logger.warn(`addUser(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Create a new user and add the user as a student , at once
 * @param {String} email
 * @param {String} password - password hash from bcrypt
 * @param {String} name
 * @param {String} address
 * @param {String} contactNo
 * @param {Boolean} activated
 * @param {Boolean} expired
 * @param {String} symbolNo
 * @param {String} puRegNo
 * @param {Number} semester
 * @param {Number} programId
 * @param {Number} syallbusId
 * @param {String} status
 * @returns
 */
async function addStudentWithUser(
  email,
  password,
  name,
  address = "",
  contactNo = "",
  activated = true,
  expired = false,
  symbolNo,
  puRegNo,
  semester,
  programId,
  syallbusId,
  status = "ACTIVE"
) {
  try {
    // TODO: check for invalid input

    // create as a transaction
    const user = await addUser(
      email,
      password,
      name,
      address,
      contactNo,
      activated,
      expired
    )
    if (user.err !== null) {
      return user
    }

    // add new student
    const student = await db.student.create({
      data: {
        symbolNo: symbolNo,
        semesterId: semester,
        programId: programId,
        puRegNo: puRegNo,
        syllabusId: syallbusId,
        userId: user.result.id,
        StudentStatus: { create: { status: status || "ACTIVE" } },
      },
    })

    const roleAssign = await assignRoleToUser(user.result.id, "student")
    if (roleAssign.err !== null) {
      return roleAssign
    }

    // valid user creation operation
    if (user.result.password) {
      delete user.result.password
    }
    student.user = user.result
    student.user.UserRoles = roleAssign.result
    return toResult(student, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. Please update method to update the resource.`
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something wrong with the data. ${err.message}`)
      )
    } else {
      logger.warn(`addStudentWithUser(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Creates teacher entry along with corresponding user entry
 * @returns
 */
async function addTeacherWithUser(
  email,
  password,
  name,
  address = "",
  contactNo = "",
  activated = true,
  expired = false
) {
  try {
    // TODO: check for invalid input

    // create as a transaction
    const user = await addUser(
      email,
      password,
      name,
      address,
      contactNo,
      activated,
      expired
    )
    if (user.err !== null) {
      return user
    }

    const teacher = await db.teacher.create({
      data: {
        userId: user.result.id,
      },
    })

    const roleAssign = await assignRoleToUser(user.result.id, "teacher")
    if (roleAssign.err !== null) {
      return roleAssign
    }

    // valid user creation operation
    if (user.result.password) {
      delete user.result.password
    }
    teacher.user = user.result
    teacher.user.UserRoles = roleAssign.result
    return toResult(teacher, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. Please update method to update the resource.`
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something wrong with the data. ${err.message}`)
      )
    } else {
      logger.warn(`addStudentWithUser(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Creates admin entry along with corresponding user entry
 * @returns
 */
async function addAdminWithUser(
  email,
  password,
  name,
  address = "",
  contactNo = "",
  activated = true,
  expired = false
) {
  try {
    // TODO: check for invalid input

    // create as a transaction
    const user = await addUser(
      email,
      password,
      name,
      address,
      contactNo,
      activated,
      expired
    )
    if (user.err !== null) {
      return user
    }

    const admin = await db.admin.create({
      data: {
        userId: user.result.id,
      },
    })

    const roleAssign = await assignRoleToUser(user.result.id, "admin")
    if (roleAssign.err !== null) {
      return roleAssign
    }

    // valid user creation operation
    if (user.result.password) {
      delete user.result.password
    }

    admin.user = user.result
    admin.user.UserRoles = roleAssign.result
    return toResult(admin, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. Please update method to update the resource.`
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something wrong with the data. ${err.message}`)
      )
    } else {
      logger.warn(`addStudentWithUser(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Change password of a user
 * @param {Number} userId  - id of the user
 * @param {String} oldPassword - old password of a user
 * @param {String} newPassword  - new password of auser
 * @returns success msg or corresponding error
 */
async function changePassword(userId, newPassword) {
  try {
    const newHash = hashPassword(newPassword)

    const userDetails = await db.user.update({
      where: { id: userId },
      data: { password: newHash },
    })
    // return user details by id
    return await getUserDetails(userDetails.id)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something went wrong with request. ${err.message}`)
      )
    } else {
      logger.warn(`changePassword(): ${err.message}`)
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
  addUser,
  addStudentWithUser,
  addTeacherWithUser,
  addAdminWithUser,
  changePassword,
}
