/**
 * This module contains db functions related to adding courses and assign/de-assign them to teachers
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const {
  errorResponse,
  internalServerError,
  NotFoundError,
} = require("../../helper/error")
const { toResult } = require("../../helper/result")
const { getLatestBatch } = require("./others")

/**
 * Add a markweightage entry
 * @param {Number} theory
 * @param {Number} practical
 * @returns
 */
async function addMarkWeightage(theory, practical) {
  try {
    const newMarkWeightage = await db.markWeightage.create({
      data: {
        theory,
        practical,
      },
    })

    return toResult(newMarkWeightage, null)
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
      logger.warn(`addMarkWeightage(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Delete a markweight id
 * @param {Number} markWeightageId
 * @returns
 */
async function deleteMarkWeightage(markWeightageId) {
  try {
    const markWeightage = await db.markWeightage.delete({
      where: { id: markWeightageId },
    })

    return toResult(markWeightage, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.meta.cause))
    } else {
      logger.warn(`addMarkWeightage(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * List all mark weightage
 */
async function listAllMarkWeightage() {
  try {
    const markWeightage = await db.markWeightage.findMany()

    return toResult(markWeightage, null)
  } catch (err) {
    logger.warn(`listAllMarkWeightage(): ${err.message}`) // Always log cases for internal server error
    return toResult(null, internalServerError())
  }
}

/**
 * Add a new course in the database
 * @param {String} code - course code
 * @param {String} title
 * @param {*} credit
 * @param {*} elective
 * @param {*} project
 * @param {*} markWeightageId
 */
async function addCourse(
  code,
  title,
  credit,
  elective = false,
  project = false,
  markWeightageId
) {
  try {
    const newCourse = await db.course.create({
      data: {
        code: code,
        name: title,
        credit: credit,
        elective: elective,
        project: project,
        markWeightageId: markWeightageId,
      },
      include: { markWeightage: true },
    })

    return toResult(newCourse, null)
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
      logger.warn(`addCourse(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Update a course in the database
 * @param {*} courseId - course id
 * @param {*} code
 * @param {*} title
 * @param {*} credit
 * @param {*} elective
 * @param {*} project
 * @param {*} markWeightageId
 * @returns
 */
async function updateCourse(
  courseId,
  code = "",
  title = "",
  credit = 0,
  elective = false,
  project = false,
  markWeightageId = 0
) {
  try {
    const newCourse = await db.course.update({
      where: { id: courseId },
      data: {
        code: code === "" ? undefined : code,
        name: title === "" ? undefined : title,
        credit: credit === 0 ? undefined : credit,
        elective: elective,
        project: project,
        markWeightageId: markWeightageId === 0 ? undefined : markWeightageId,
      },
      include: { markWeightage: true },
    })

    return toResult(newCourse, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.meta.cause))
    } else {
      logger.warn(`addCourse(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}
/**
 * Delete a course
 * @param {*} courseId - id of the course
 * @param {*} code  - code of the course
 * @returns
 */
async function deleteCourse(courseId = 0, code = "") {
  try {
    const newCourse = await db.course.delete({
      where: {
        id: courseId > 0 ? courseId : undefined,
        code: code === "" ? undefined : code,
      },
      include: { markWeightage: true },
    })

    return toResult(newCourse, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.meta.cause))
    } else {
      logger.warn(`addCourse(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Add a course to a program syllabus
 * @param {Number} courseId
 * @param {Number} programId
 * @param {Number} syllabusId
 * @param {Number} semesterId
 * @returns course details or corresponding error
 */
async function addCourseToSyllabus(
  courseId,
  programId,
  syllabusId,
  semesterId
) {
  try {
    const assignCourse = await db.programCourses.create({
      data: {
        courseId: courseId,
        programId: programId,
        syllabusId: syllabusId,
        semesterId: semesterId,
      },
      include: { syllabus: { include: { program: true } } },
    })

    return toResult(assignCourse, null)
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
    } else if (
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
    } else {
      logger.warn(`addCourseToSyllabus(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Add multiple course to a program syllabus for a semester
 * @param {*} courses
 * @param {*} programId
 * @param {*} syllabusId
 * @param {*} semesterId
 * @returns course details or corresponding error
 */
async function addMultipleCourseToSyllabus(
  courses = [],
  programId,
  syllabusId,
  semesterId
) {
  try {
    // data entity
    const data = courses.map((course) => ({
      courseId: course,
      programId: programId,
      syllabusId: syllabusId,
      semesterId: semesterId,
    }))

    const assignCourse = await db.programCourses.createMany({
      data: data,
      skipDuplicates: true,
    })

    return toResult(assignCourse, null)
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
    } else if (
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
    } else {
      console.log(err) //log purpose
      logger.warn(`addMultipleCourseToSyllabus(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Remove a course from a program syllabus
 * @param {Number} courseId
 * @param {Number} programId
 * @param {Number} syllabusId
 * @param {Number} semesterId
 *
 * @returns course details or corresponding error
 */
async function removeCourseFromSyllabus(
  courseId,
  programId,
  syllabusId,
  semesterId
) {
  try {
    const assignCourse = await db.programCourses.delete({
      where: {
        programId_semesterId_syllabusId_courseId: {
          courseId: courseId,
          semesterId: semesterId,
          syllabusId: syllabusId,
          programId: programId,
        },
      },
      include: { syllabus: { include: { program: true } } },
    })

    return toResult(assignCourse, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.meta.cause))
    } else if (
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
    } else {
      logger.warn(`addCourse(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Assign course to a teacher
 * @param {*} teacherId
 * @param {*} courseId
 * @param {*} programId
 * @returns
 */
async function assignCourseToTeacher(teacherId, courseId, programId) {
  try {
    const batchId = await getLatestBatch()

    if (batchId.err !== null) {
      return batchId
    }

    // check if the provided program has such a course or not
    await db.programCourses.findFirstOrThrow({
      where: { AND: [{ courseId: courseId }, { programId: programId }] },
    })

    // assign course to a teacher
    const assignCourse = await db.teacherCourses.create({
      data: {
        courseId: courseId,
        programId: programId,
        teacherId: teacherId,
        batchId: batchId.result.id,
      },
      include: {
        batch: true,
        course: { include: { markWeightage: true } },
        program: true,
        teacher: true,
      },
    })

    // for the current batch, update the student marks's teacher column
    // with this teacher
    const updateStudentMarks = await db.studentMarks.updateMany({
      where: { AND: [{ courseId: courseId }, { batchId: batchId.result.id }] },
      data: { teacherId: teacherId },
    })

    return toResult(assignCourse, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, NotFoundError(err.message))
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
    } else if (
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
    } else {
      logger.warn(`addCourse(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Remove course assignment from a teacher
 * @param {Number} teacherId
 * @param {Number} courseId
 * @param {Number} programId
 * @returns
 */
async function removeCourseFromTeacher(teacherId, courseId, programId) {
  try {
    const batchId = await getLatestBatch()

    if (batchId.err !== null) {
      return batchId
    }

    const removeCourse = await db.teacherCourses.delete({
      where: {
        teacherId_courseId_programId_batchId: {
          teacherId: teacherId,
          courseId: courseId,
          programId: programId,
          batchId: batchId.result.id,
        },
      },
      include: {
        batch: true,
        course: { include: { markWeightage: true } },
        program: true,
        teacher: true,
      },
    })

    return toResult(removeCourse, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.meta.cause))
    } else if (
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
    } else {
      logger.warn(`addCourse(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * List all courses in the database
 * @param {Number} programId
 * @param {Number} syllabusId
 * @returns all the courses matching the criteria
 */
async function listAllCourses(programId = 0, syllabusId = 0) {
  try {
    const courses = await db.course.findMany({
      where: {
        ProgramCourses: {
          some: {
            programId: programId > 0 ? programId : undefined,
            syllabusId: syllabusId > 0 ? syllabusId : undefined,
          },
        },
      },
      include: {
        ProgramCourses: {
          include: {
            syllabus: { include: { program: true } },
          },
        },
        markWeightage: true,
        TeacherCourses: {
          include: {
            teacher: {
              select: {
                id: true,
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    })
    return toResult(courses, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse(
          "Bad Request",
          `Something wrong with the request. ${err.meta.cause}`
        )
      )
    } else {
      logger.warn(`listAllCourses(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Fetch a certain course
 * @param {Number} courseId
 * @param {String} courseCode
 *
 * @returns detail of the course or corresponding error
 */
async function getCourse(courseId = 0, courseCode = "") {
  try {
    const courses = await db.course.findFirstOrThrow({
      where: {
        id: courseId > 0 ? courseId : undefined,
        code: courseCode === "" ? undefined : courseCode,
      },
      include: {
        ProgramCourses: {
          include: {
            syllabus: { include: { program: true } },
          },
        },
        markWeightage: true,
        TeacherCourses: {
          include: {
            teacher: {
              select: {
                id: true,
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    })
    return toResult(courses, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(
        null,
        NotFoundError("The requested course does not exist.")
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse(
          "Bad Request",
          `Something wrong with the request. ${err.meta.cause}`
        )
      )
    } else {
      logger.warn(`getCourse(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

module.exports = {
  addMarkWeightage,
  deleteMarkWeightage,
  addCourse,
  listAllMarkWeightage,
  updateCourse,
  deleteCourse,
  addCourseToSyllabus,
  removeCourseFromSyllabus,
  assignCourseToTeacher,
  removeCourseFromTeacher,
  listAllCourses,
  getCourse,
  addMultipleCourseToSyllabus,
}
