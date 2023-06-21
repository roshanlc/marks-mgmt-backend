/**
 * This module contains db functions related to adding courses and assign/de-assign them to teachers
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const { errorResponse, internalServerError } = require("../../helper/error")
const { toResult } = require("../../helper/result")

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

module.exports = {
  addMarkWeightage,
  deleteMarkWeightage,
  addCourse,
  listAllMarkWeightage,
  updateCourse,
  deleteCourse,
}
