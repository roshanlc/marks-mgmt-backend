/**
 * This module contains methods to create faculties, departments, programs, syllabus and related entities.
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const { errorResponse, internalServerError } = require("../../helper/error")
const { toResult } = require("../../helper/result")

/**
 * Create a new faculty
 * @param {String} facultyName - name of faculty
 * @param {String} facultyHead - head of the faculty
 * @returns newly created faculty details or corresponding error
 */
async function addFaculty(facultyName, facultyHead = "") {
  try {
    const faculty = await db.faculty.create({
      data: { name: facultyName, head: facultyHead },
    })

    return toResult({ faculty: faculty }, null)
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
      logger.warn(`addFaculty(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Create a new department under a faculty
 * @param {String} deptName - name of department
 * @param {String} deptHead - head of department
 * @param {Number} facultyId - id of the faculty it belongs to
 *
 * @returns newly created department details or corresponding error
 */
async function addDepartment(deptName, deptHead = "", facultyId) {
  try {
    const dept = await db.department.create({
      data: { name: deptName, head: deptHead, facultyId: facultyId },
      include: { faculty: true },
    })

    return toResult({ department: dept }, null)
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
      logger.warn(`addDepartment(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}
/**
 * Create a new program under a department
 * @param {String} programName - name of the program
 * @param {String} programHead - head of the program if any
 * @param {Number} deptId - id of department it belongs to
 * @param {Number} levelId - id of level it belongs to
 * @returns - details of created program or corresponding error
 */

async function addProgram(programName, programHead = "", deptId, levelId) {
  try {
    const program = await db.program.create({
      data: {
        name: programName,
        head: programHead,
        departmentId: deptId,
        levelId: levelId,
      },
      include: { department: true, level: true },
    })

    return toResult({ program: program }, null)
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
      logger.warn(`addProgram(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Create a syllabus under a program
 * @param {String} syllabusName - name of the syllabus
 * @param {Number} programId - id of program it belongs to
 * @returns - details of created syllabus or corresponding error
 */

async function addSyllabus(syllabusName, programId) {
  try {
    const syllabus = await db.syllabus.create({
      data: { name: syllabusName, programId: programId },
      include: { program: true },
    })

    return toResult({ syllabus: syllabus }, null)
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
      logger.warn(`addSyllabus(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Create a new level entity
 * @param {String} levelName - name of the level ,e.g Bachelor, Master
 * @returns newly created level's details or corresponding error
 */
async function addLevel(levelName) {
  try {
    const level = await db.level.create({ data: { name: levelName } })

    return toResult({ level: level }, null)
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
      logger.warn(`addLevel(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

module.exports = {
  addFaculty,
  addDepartment,
  addProgram,
  addSyllabus,
  addLevel,
}
