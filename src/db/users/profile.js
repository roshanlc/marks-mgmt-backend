// Db actions related to profile
const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const { errorResponse, internalServerError } = require("../../helper/error")
const { toResult } = require("../../helper/result")
const { getUserDetails } = require("./user")

/**
 * Returns profile details
 * @param {Number} userId
 */
async function getProfileDetails(userId) {
  try {
    const profile = await getUserDetails(userId)

    // incase of error, return as it is
    if (profile.err !== null || profile.result.UserRoles.length === 0) {
      return profile
    }

    // loop over user roles array
    // extract "roles"
    for (const roleObj of profile.result.UserRoles) {
      if (roleObj.role.name === "student") {
        const studentDetails = await getStudentDetails(profile.result.id)
        // Append to the user details object

        profile.result.student = studentDetails
      } else if (roleObj.role.name === "teacher") {
        const teacherDetails = await getTeacherDetails(profile.result.id)

        profile.result.teacher = teacherDetails
      }
    }

    // TODO: add support for other profile types (dept head, program head,...)

    // return profile details
    return profile
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
      return toResult(null, internalServerError)
    }
  }
}

/**
 * It provides complete details about a student
 * Courses taken, marks for current semester
 * @param {Number} userId
 */
async function getStudentDetails(userId = 0, studentId = 0) {
  // TODO: add more details about student such as courses taken
  return await db.student.findFirstOrThrow({
    where: { OR: [{ userId: userId }, { id: studentId }] },
  })
}

/**
 * It provides complete details about a teacher
 * Courses taught and other details for current semester
 * @param {Number} userId
 */
async function getTeacherDetails(userId = 0, teacherId = 0) {
  // TODO: add more details about teacher such as courses taught
  return await db.teacher.findFirstOrThrow({
    where: { OR: [{ userId: userId }, { id: teacherId }] },
  })
}

module.exports = { getProfileDetails, getStudentDetails, getTeacherDetails }
