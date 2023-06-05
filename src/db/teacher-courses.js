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
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Checks whether given teacher teaches a course at a program in current semester
 * @param {Number} teacherId
 * @param {Number} programId
 * @param {Number} courseId
 * @param {String} courseCode
 * @param {String} courseName
 * @returns
 */
async function isTaughtBy(
  teacherId,
  programId,
  courseId = 0,
  courseCode = "",
  courseName = ""
) {
  try {
    const currentBatch = await getLatestBatch()

    if (currentBatch.err !== null) {
      return currentBatch
    }

    const state = await db.teacherCourses.findFirst({
      where: {
        AND: [
          { teacherId: teacherId },
          { programId: programId },
          { batchId: currentBatch.result.id },
          {
            course: {
              OR: [
                { code: courseCode },
                { id: courseId },
                { name: courseName },
              ],
            },
          },
        ],
      },
    })

    // just return false incase of error or other problems
    if (state === null) {
      return toResult(false, null)
    }
    return toResult(true, null)
  } catch (err) {
    logger.warn(`teachesCourse(): ${err.message}`) // Always log cases for internal server error
    return toResult(null, internalServerError())
  }
}
/**
 * Add marks of a student for a course
 * @param {Number} teacherId
 * @param {Number} studentId
 * @param {Number} courseId
 * @param {Number} theory
 * @param {Number} practical
 * @param {Boolean} NotQualified
 * @returns added marks object if successfull or error incase of failure
 */
async function addMarks(
  teacherId = 0,
  studentId,
  courseId,
  theory,
  practical,
  NotQualified = false
) {
  try {
    const marksAddition = await db.studentMarks.create({
      data: {
        courseId: courseId,
        studentId: studentId,
        theory: theory,
        practical: practical,
        NotQualified: NotQualified,
        teacherId: teacherId,
      },
    })

    return toResult(marksAddition, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return toResult(
        null,
        errorResponse(
          "Not Found",
          `Please provide valid details. Failed on foreign constraint fields.`
        )
      )
    } else if (
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
      logger.warn(`addMarks(): ${err.code}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

module.exports = { getTeacherCourses, isTaughtBy, addMarks }
