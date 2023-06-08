/**
 * This module contains db functions related to miscellanous activities
 * such as adding batch, getting latest batch, etc
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../helper/logger")
const { errorResponse, internalServerError } = require("../helper/error")
const { toResult } = require("../helper/result")

/**
 * Add new batch in the db
 * Used to initiate new semester
 * @param {Number} year
 * @param {String} season
 */
async function addBatch(year, season) {
  try {
    // TODO: add a logic to prevent same year and season being added again
    const batchInfo = await db.batch.create({
      data: { year: year, season: season },
    })
    return toResult(batchInfo, null)
  } catch (err) {
    logger.warn(`addBatch(): ${err.message}`) // Always log cases for internal server error
    return toResult(null, internalServerError)
  }
}

/**
 *
 * @returns Latest batch info
 */
async function getLatestBatch() {
  try {
    const batchInfo = await db.batch.findFirstOrThrow({
      orderBy: { id: "desc" },
    })
    return toResult(batchInfo, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "No entry found in the batch table.")
      )
    } else {
      logger.warn(`getLatestBatch(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * @returns All the faculties
 */
async function getFaculties() {
  try {
    const faculties = await db.faculty.findMany()
    return toResult(faculties, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getFaculties(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * @returns specific faculty
 */
async function getFacultyById(facultyId = 0, facultyName = "") {
  try {
    const faculty = await db.faculty.findFirstOrThrow({
      where: { OR: [{ id: facultyId }, { name: facultyName }] },
    })
    return toResult(faculty, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "No entry found in the faculty table.")
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getFacultyById(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * Get all departments
 * @returns All the departments
 */
async function getDepartments() {
  try {
    const departments = await db.department.findMany({
      include: { faculty: true, Program: { include: { level: true } } },
    })
    return toResult(departments, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getDepartments(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * Get department by id
 * @returns specific department
 */
async function getDepartmentById(deptId = 0, deptName = "") {
  try {
    const faculty = await db.department.findFirstOrThrow({
      where: { OR: [{ id: deptId }, { name: deptName }] },
      include: { faculty: true, Program: { include: { level: true } } },
    })
    return toResult(faculty, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "No entry found in the faculty table.")
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getDepartmentById(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * Get all programs
 * @returns All the programs
 */
async function getPrograms() {
  try {
    const programs = await db.program.findMany({
      include: {
        department: { include: { faculty: true } },
        level: true,
        ProgramCourses: true,
        ProgramSemesters: true,
        RunningSemesters: true,
      },
    })
    return toResult(programs, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getPrograms(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * Get department by id
 * @returns specific department
 */
async function getProgramById(programId = 0, programName = "") {
  try {
    const program = await db.program.findFirstOrThrow({
      where: { OR: [{ id: programId }, { name: programName }] },
      include: {
        department: { include: { faculty: true } },
        level: true,
        ProgramCourses: true,
        ProgramSemesters: true,
      },
    })
    return toResult(program, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "No entry found in the faculty table.")
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getProgramById(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * Get all syllabus
 * @returns All the syllabus
 */
async function getAllSyllabus() {
  try {
    const syllabus = await db.syllabus.findMany({
      include: { program: { include: { department: true, level: true } } },
    })
    return toResult(syllabus, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getAllSyallabus(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * Get syallbus by id
 * @returns specific syllabus details
 */
async function getSyllabusById(syallabusId = 0, syallabusName = "") {
  try {
    const program = await db.syllabus.findFirstOrThrow({
      where: { OR: [{ id: syallabusId }, { name: syallabusName }] },
      include: { program: { include: { department: true, level: true } } },
    })
    return toResult(program, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "No entry found in the syallbus table.")
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getSyllabusById(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

module.exports = {
  addBatch,
  getLatestBatch,
  getDepartmentById,
  getDepartments,
  getFaculties,
  getFacultyById,
  getProgramById,
  getPrograms,
  getAllSyllabus,
  getSyllabusById,
}
