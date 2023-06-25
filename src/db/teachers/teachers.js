// Db actions related to user model
const { PrismaClient, Prisma } = require("@prisma/client")
const { toResult } = require("../../helper/result")
const { errorResponse, internalServerError } = require("../../helper/error")
const logger = require("../../helper/logger")
const db = new PrismaClient()

/**
 * List all teachers.
 * It is a very Expensive Operation
 */
async function listAllTeachers() {
  try {
    const teachers = await db.teacher.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return toResult({ teachers: teachers }, null)
  } catch (err) {
    // check for Known erorr explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`listAllTeachers(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * List teachers matching the given crieteria.
 * Put 0 to neglect the option.
 * @param {Number} programId
 * @param {Number} departmentId
 * @returns list of teachers matching given criteria
 */
async function listTeachersBy(programId = 0, departmentId = 0) {
  // TODO: add support for listing by status
  try {
    const teachers = await db.teacher.findMany({
      where: {
        TeacherCourses: {
          some: {
            programId: programId > 0 ? programId : undefined,
            program: {
              departmentId: departmentId > 0 ? departmentId : undefined,
            },
          },
        },
      },
    })

    return toResult({ teachers: teachers }, null)
  } catch (err) {
    // check for Known erorr explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`listTeachersBy(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Returns a specific teacher's details
 * @param {Number} userId - id from user table
 * @param {Number} teacherId - id from teacher table
 * @returns A teacher's detail or corresponding error
 */
async function getATeacherDetails(userId = 0, teacherId = 0) {
  try {
    const teacher = await db.teacher.findFirstOrThrow({
      where: { OR: [{ userId: userId }, { id: teacherId }] },
      include: {
        user: { select: { id: true, name: true, email: true } },
        TeacherCourses: {
          include: { course: true, program: true, batch: true },
        },
      },
    })

    return toResult({ teacher: teacher }, null)
  } catch (err) {
    // check for Known erorr explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse(
          "Not Found",
          "Please provide valid user id or teacher id."
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getATeacherDetails(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Get the total number of teachers.
 * Total teachers in the database.
 */
async function getAllTeachersCount() {
  try {
    const total = await db.teacher.count()

    const result = {
      total: total,
    }

    return toResult(result, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "Please provide valid details.")
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getAllTeachersCount(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}
/**
 * Delete a teacher from db
 * @param {*} teacherId
 * @returns - deleted teacher details or corresponding error
 */

async function deleteTeacher(teacherId) {
  try {
    const userDetails = await db.teacher.findFirstOrThrow({
      where: { id: teacherId },
    })

    // all other user related details should be deleted automatically
    const teacher = await db.user.delete({
      where: { id: userDetails.userId },
      include: { Teacher: true },
    })

    // delte password entry from data
    if (teacher.password) {
      delete teacher.password
    }

    return toResult(teacher, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse(
          "Not Found",
          `Please provide valid details. ${err.message}`
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`deleteTeacher(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

module.exports = {
  listAllTeachers,
  listTeachersBy,
  getATeacherDetails,
  getAllTeachersCount,
  deleteTeacher,
}
