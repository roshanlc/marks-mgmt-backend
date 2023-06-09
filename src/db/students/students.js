// Db actions related to user model
const { PrismaClient, Prisma } = require("@prisma/client")
const { toResult } = require("../../helper/result")
const { errorResponse, internalServerError } = require("../../helper/error")
const logger = require("../../helper/logger")
const db = new PrismaClient()

/**
 * List all students.
 * It is a very Expensive Operation
 */
async function listAllStudents() {
  try {
    const students = await db.student.findMany({
      include: {
        program: { select: { department: true, level: true } },
        user: { select: { id: true, name: true } },
        syllabus: true,
      },
    })

    return toResult({ students: students }, null)
  } catch (err) {
    // check for Known erorr explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`listAllStudents(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * List students matching the given crieteria.
 * Put 0 to neglect the option.
 * @param {Number} programId
 * @param {Number} syllabusId
 * @param {Number} departmentId
 * @returns list of students matching given criteria
 */
async function listStudentsBy(programId = 0, syllabusId = 0, departmentId = 0) {
  try {
    const options = []
    // set options
    if (programId > 0) {
      options.push({ programId: programId })
    }
    if (syllabusId > 0) {
      options.push({ syllabusId: syllabusId })
    }
    if (departmentId > 0) {
      options.push({ program: { departmentId: departmentId } })
    }

    const students = await db.student.findMany({
      where: {
        AND: options,
      },
      include: {
        program: { select: { department: true, level: true } },
        user: { select: { id: true, name: true } },
        syllabus: true,
      },
    })

    return toResult({ students: students }, null)
  } catch (err) {
    // check for Known erorr explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`listAllStudents(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

module.exports = { listAllStudents, listStudentsBy }
