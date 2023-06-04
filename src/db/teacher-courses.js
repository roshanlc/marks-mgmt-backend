/**
 * This module contains db functions related to teacher viewing courses
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../helper/logger")
const { errorResponse, internalServerError } = require("../helper/error")
const { toResult } = require("../helper/result")
const { getLatestBatch } = require("./others")

/**
 * Get courses taught by a teacher
 * @param {Number} teacherId - id of the teacher
 */
async function getTeacherCourses(teacherId) {
  try {
    // get the latest batch from db
    const latestBatch = await getLatestBatch()
    if (latestBatch.err !== null) {
      return latestBatch // return incase of error
    }

    // teacher details
    const teacher = await db.teacher.findFirstOrThrow({
      where: { id: teacherId },
    })

    // get courses taught
    const courses = await db.teacherCourses.findMany({
      where: {
        AND: [
          { teacherId: { equals: teacherId } },
          { batchId: latestBatch.result.id },
        ],
      },
      include: {
        course: {
          include: {
            ProgramCourses: {
              select: {
                program: true,
                semester: true,
                syllabus: true,
              },
            },
          },
        },
      },
    })

    return toResult({ teacher: teacher, courses: courses }, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "Please provide valid teacher id.")
      )
    } else {
      logger.warn(`getTeacherCourses(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

// TODO: add get courses for teacher by a program
module.exports = { getTeacherCourses }
