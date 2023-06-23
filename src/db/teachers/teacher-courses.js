/**
 * This module contains db functions related to teacher viewing courses
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const {
  errorResponse,
  internalServerError,
  badRequestError,
} = require("../../helper/error")
const { toResult } = require("../../helper/result")
const { getLatestBatch } = require("../programs/others")
const { NotFoundError } = require("../../helper/error")

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
        program: true,
        batch: true,
        course: { include: { markWeightage: true } },
      },
    })

    const updatedCourses = []
    // add syllabus and semester info in the response
    for (const course of courses) {
      const syllabus = await db.programCourses.findFirstOrThrow({
        where: { courseId: course.courseId, programId: course.programId },
        include: { syllabus: true, semester: true },
      })
      course.semester = syllabus.semester
      course.syllabus = syllabus.syllabus
      updatedCourses.push(course)
    }

    return toResult({ teacher: teacher, courses: updatedCourses }, null)
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
async function addMarksByTeacher(
  teacherId = 0,
  studentId,
  courseId,
  theory,
  practical,
  NotQualified = false
) {
  try {
    const batchId = await getLatestBatch()

    // check for errors
    if (batchId.err !== null) {
      return batchId
    }

    const marksAddition = await db.studentMarks.create({
      data: {
        courseId: courseId,
        studentId: studentId,
        theory: theory,
        practical: practical,
        NotQualified: NotQualified,
        teacherId: teacherId,
        batchId: batchId.result.id,
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
      logger.warn(`addMarks(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Update marks of a student for a course
 * @param {Number} studentId
 * @param {Number} courseId
 * @param {Number} theory
 * @param {Number} practical
 * @param {Boolean} NotQualified
 * @returns Updated marks object if successfull or error incase of failure
 */
async function updateMarksOfStudent(
  studentId,
  courseId,
  theory,
  practical,
  NotQualified = false
) {
  try {
    const marksAddition = await db.studentMarks.update({
      where: { studentId_courseId: { studentId, courseId } },
      data: {
        theory: theory,
        practical: practical,
        NotQualified: NotQualified,
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
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something wrong went with the request. ${err.message}`)
      )
    } else {
      logger.warn(`updateMarks(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * View marks by teacher of all students for a course they teach
 * @param {Number} teacherId
 * @param {Number} courseId
 * @param {Number} programId
 */
async function viewMarksByTeacher(teacherId, courseId, programId) {
  try {
    const latestBatch = await getLatestBatch()
    if (latestBatch.err !== null) {
      return latestBatch
    }

    const teaches = await isTaughtBy(teacherId, programId, courseId)
    // return err
    if (teaches.err !== null) {
      return teaches
    }

    if (!teaches) {
      toResult(
        null,
        NotFoundError("Unable to find records of provided details")
      )
    }

    // retrieve marks
    const marks = await db.studentMarks.findMany({
      where: {
        AND: [
          { courseId: courseId },
          { teacherId: teacherId },
          {
            batchId: latestBatch.result.id,
            student: { programId: programId },
          },
        ],
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
    })

    return toResult(
      {
        teacherId: teacherId,
        courseId: courseId,
        programId: programId,
        marks: marks,
      },
      null
    )
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "Please provide valid details.")
      )
    } else {
      logger.warn(`viewMarksByTeacher(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Update the marks of group of students for a course
 * @param {Number} teacherId
 * @param {Number} courseId
 * @param {Object} marks
 * @returns array of successfull and failed marks update
 */
async function updateMarksOfAllStudentsForCourse(courseId, marks) {
  try {
    const batchId = await getLatestBatch()

    if (batchId.err !== null) {
      return batchId
    }

    const success = []
    const errors = []
    for (const item of marks) {
      await db.studentMarks
        .update({
          where: {
            studentId_courseId: {
              studentId: item.studentId,
              courseId: courseId,
            },
          },
          data: {
            theory: item.theory,
            practical: item.practical,
            NotQualified: item.notQualified,
          },
        })
        .then((response) => success.push({ ...response }))
        .catch((err) => {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2003"
          ) {
            errors.push({
              ...item,
              ...errorResponse(
                "Not Found",
                `Please provide valid details. Failed on foreign constraint fields.`
              ),
            })
          } else if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            errors.push({
              ...item,
              ...errorResponse("Not Found", err.meta.cause),
            })
          } else {
            errors.push({
              ...item,
              ...errorResponse(
                "Bad Request",
                `Something wrong went with request.${err.meta.cause}`
              ),
            })
          }
        })
    }

    return toResult({ success: success, errors: errors }, null)
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
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.meta.cause))
    } else {
      logger.warn(`updateMarksOfAllStudentsForCourse(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Create the marks of group of students for a course
 * @param {Number} teacherId
 * @param {Number} courseId
 * @param {Object} marks
 * @returns array of successfull and failed marks creation
 */
async function addMarksOfAllStudentsForCourse(teacherId = 0, courseId, marks) {
  try {
    const batchId = await getLatestBatch()

    if (batchId.err !== null) {
      return batchId
    }

    const success = []
    const errors = []
    for (const item of marks) {
      await db.studentMarks
        .create({
          data: {
            studentId: item.studentId,
            courseId: courseId,
            batchId: batchId.result.id,
            theory: item.theory,
            practical: item.practical,
            NotQualified: item.notQualified,
            teacherId: teacherId > 0 ? teacherId : undefined,
          },
        })
        .then((response) => success.push({ ...response }))
        .catch((err) => {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            errors.push({
              ...item,
              ...errorResponse(
                "Conflict",
                `Resource already exists. Please update method to update the resource.`
              ),
            })
          } else if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2003"
          ) {
            errors.push({
              ...item,
              ...errorResponse(
                "Not Found",
                `Please provide valid details. Failed on foreign constraint fields.`
              ),
            })
          } else {
            errors.push({
              ...item,
              ...errorResponse(
                "Bad Request",
                `Something wrong went with request.${err.message}`
              ),
            })
          }
        })
    }

    return toResult({ success: success, errors: errors }, null)
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
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.meta.cause))
    } else {
      logger.warn(err)
      logger.warn(`addMarksOfAllStudentsForCourse(): ${err}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}
module.exports = {
  getTeacherCourses,
  isTaughtBy,
  addMarksByTeacher,
  viewMarksByTeacher,
  updateMarksOfStudent,
  updateMarksOfAllStudentsForCourse,
  addMarksOfAllStudentsForCourse,
}
