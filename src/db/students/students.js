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
        program: { include: { department: true, level: true } },
        user: { select: { id: true, name: true, email: true } },
        syllabus: true,
        semester: true,
        StudentStatus: true,
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
      return toResult(null, internalServerError())
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
  // TODO: add support for listing by status
  try {
    const students = await db.student.findMany({
      where: {
        AND: [
          { programId: programId > 0 ? programId : undefined },
          { syllabusId: syllabusId > 0 ? syllabusId : undefined },
          {
            program: {
              departmentId: departmentId > 0 ? departmentId : undefined,
            },
          },
        ],
      },
      include: {
        program: { include: { department: true, level: true } },
        user: { select: { id: true, name: true, email: true } },
        syllabus: true,
        semester: true,
        StudentStatus: true,
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
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Returns a specific student's details
 * @param {Number} userId - id from user table
 * @param {Number} studentId - id from student table
 * @returns A student's detail or corresponding error
 */
async function getAStudentDetails(userId = 0, studentId = 0) {
  try {
    const student = await db.student.findFirstOrThrow({
      where: { OR: [{ userId: userId }, { id: studentId }] },
      include: {
        program: { include: { department: true, level: true } },
        user: { select: { id: true, name: true, email: true } },
        syllabus: true,
        semester: true,
        StudentStatus: true,
      },
    })

    return toResult({ student: student }, null)
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
          "Please provide valid user id or student id."
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`listAllStudents(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Get the total number of students.
 * Total students in the database.
 */
async function getAllStudentsCount() {
  try {
    const total = await db.student.count()
    const activeStudents = await db.studentStatus.count({
      where: { status: "ACTIVE" },
    })
    // const allDepts = await db.department.findMany()
    const allPrograms = await db.program.findMany()
    const progStudents = []

    for (const prog of allPrograms) {
      let temp = await db.student.count({
        where: { programId: prog.id },
      })
      progStudents.push({ ...prog, students: temp })
    }

    const result = {
      total: total,
      active: activeStudents,
      programs: progStudents,
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
      logger.warn(`getAllStudentsCount(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Get count of students matching the given criteria.
 * Provide no input to ignore the field.
 * @param {Number} facultyId - faculty id
 * @param {Number} departmentId - department id
 * @param {Number} programId - program id
 * @param {Number} syllabusId - syllabus id
 * @param {String} status - "ACTIVE" | "ARCHIVE"  | "DROPOUT"
 */
async function getStudentsCountBy(
  facultyId = 0,
  departmentId = 0,
  programId = 0,
  syllabusId = 0,
  status = "ACTIVE"
) {
  try {
    const studentsCount = await db.student.count({
      where: {
        StudentStatus: { some: { status: status } },
        program: {
          id: programId > 0 ? programId : undefined,
          department: {
            id: departmentId > 0 ? departmentId : undefined,
            faculty: { id: facultyId > 0 ? facultyId : undefined },
          },
        },
        syllabusId: syllabusId > 0 ? syllabusId : undefined,
      },
    })

    return toResult({ students: studentsCount }, null)
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
      logger.warn(`getStudentsCountBy(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

module.exports = {
  listAllStudents,
  listStudentsBy,
  getAStudentDetails,
  getAllStudentsCount,
  getStudentsCountBy,
}
