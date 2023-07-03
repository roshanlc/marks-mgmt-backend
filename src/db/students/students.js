// Db actions related to user model
const { PrismaClient, Prisma } = require("@prisma/client")
const { toResult } = require("../../helper/result")
const { errorResponse, internalServerError } = require("../../helper/error")
const logger = require("../../helper/logger")
const {
  createMarksForSemesters,
  deleteMarksOfStudentForSemesters,
} = require("./student-marks")
const { getLatestBatch } = require("../programs/others")
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            address: true,
            activated: true,
            expired: true,
          },
        },
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            address: true,
            activated: true,
            expired: true,
          },
        },
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

/**
 * Delete a student by student id
 * @param {*} studentId - id of student
 * @returns deleted student or corresponding error
 */
async function deleteStudent(studentId) {
  try {
    const userDetails = await db.student.findFirstOrThrow({
      where: { id: studentId },
    })

    // all other user related details should be deleted automaticalyl
    const student = await db.user.delete({
      where: { id: userDetails.userId },
      include: { Student: true },
    })

    // delte password entry from data
    if (student.password) {
      delete student.password
    }

    return toResult(student, null)
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
      logger.warn(`deleteStudent(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Update details of a student
 * @param {Number} studentId
 * @param {Number} symbolNo
 * @param {Number} puRegdNo
 * @param {Number} semesterId
 * @param {String} status - supported values: ACTIVE | ARCHIVE | DROPOUT
 *
 * @returns updated student details or corresponding error
 */
async function updateStudentDetails(
  studentId,
  symbolNo = "",
  puRegNo = "",
  semesterId = 0, // upgrade or downgrade semesters
  status = ""
) {
  try {
    // TODO: Add support to change between programs or syllabus

    const latestBatch = await getLatestBatch()

    if (latestBatch.err !== null) {
      return latestBatch
    }

    const oldDetails = await db.student.findFirstOrThrow({
      where: { id: studentId },
      include: { StudentStatus: true },
    })

    const newDetails = await db.student.update({
      where: { id: studentId },
      data: {
        symbolNo: symbolNo === "" ? undefined : symbolNo,
        puRegNo: puRegNo === "" ? undefined : puRegNo,
        semesterId: semesterId > 0 ? semesterId : undefined,
        StudentStatus: {
          update: {
            where: {
              studentId_status: {
                status: oldDetails.StudentStatus[0]?.status || undefined,
                studentId: studentId,
              },
            },
            data: { status: status !== "" ? status : undefined },
          },
        },
      },
    })

    // upgrade or downgrade semester
    // Downgrade will delete course marks of student of higher semesters
    const semDiff = newDetails.semesterId - oldDetails.semesterId
    if (semDiff > 0) {
      // upgrade semester
      const upgrade = await createMarksForSemesters(
        studentId,
        oldDetails.semesterId + 1,
        newDetails.semesterId,
        latestBatch.result.id
      )

      if (upgrade.err !== null) {
        return upgrade
      }
    } else if (semDiff < 0) {
      const downgrade = await deleteMarksOfStudentForSemesters(
        studentId,
        newDetails.semesterId + 1,
        oldDetails.semesterId
      )

      if (downgrade.err !== null) {
        return downgrade
      }
    }

    return toResult({ student: newDetails }, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(
        null,
        errorResponse(
          "Not Found",
          err.message || "Please provide valid details."
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
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`createMarksForSemesters(): ${err}`) // Always log cases for internal server error
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
  deleteStudent,
  updateStudentDetails,
}
