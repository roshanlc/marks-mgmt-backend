// Db actions related to user model
const { PrismaClient, Prisma } = require("@prisma/client")
const { toResult } = require("../../helper/result")
const {
  errorResponse,
  internalServerError,
  badRequestError,
} = require("../../helper/error")
const logger = require("../../helper/logger")
const { hashPassword } = require("../../helper/password")
const { addTeacherWithUser } = require("../users/user")
const db = new PrismaClient()

/**
 * List all teachers.
 * It is a very Expensive Operation
 */
async function listAllTeachers() {
  try {
    const teachers = await db.teacher.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        TeacherCourses: {
          include: { course: true, program: true, batch: true },
        },
      },
    })

    return toResult({ teachers: teachers }, null)
  } catch (err) {
    // check for Known erorr explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`listAllTeachers(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * List teachers matching the given crieteria.
 * Put 0 to neglect the option.
 * @param {Number} programId
 * @param {Number} departmentId
 * @returns list of teachers matching given criteria
 */
async function listTeachersBy(programId = 0, departmentId = 0) {
  // TODO: add support for listing by status
  try {
    const teachers = await db.teacher.findMany({
      where: {
        TeacherCourses: {
          some: {
            programId: programId > 0 ? programId : undefined,
            program: {
              departmentId: departmentId > 0 ? departmentId : undefined,
            },
          },
        },
      },
      include: {
        TeacherCourses: {
          include: { course: true, program: true, batch: true },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return toResult({ teachers: teachers }, null)
  } catch (err) {
    // check for Known erorr explicitly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`listTeachersBy(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Returns a specific teacher's details
 * @param {Number} userId - id from user table
 * @param {Number} teacherId - id from teacher table
 * @returns A teacher's detail or corresponding error
 */
async function getATeacherDetails(userId = 0, teacherId = 0) {
  try {
    const teacher = await db.teacher.findFirstOrThrow({
      where: { OR: [{ userId: userId }, { id: teacherId }] },
      include: {
        user: { select: { id: true, name: true, email: true } },
        TeacherCourses: {
          include: {
            course: { include: { markWeightage: true } },
            program: true,
            batch: true,
          },
        },
      },
    })

    const updatedCourses = []
    // add syllabus and semester info in the response
    for (const course of teacher.TeacherCourses) {
      const syllabus = await db.programCourses.findFirstOrThrow({
        where: { courseId: course.courseId, programId: course.programId },
        include: { syllabus: true, semester: true },
      })
      course.semester = syllabus.semester
      course.syllabus = syllabus.syllabus
      updatedCourses.push(course)
    }

    // update courses
    teacher.TeacherCourses = updatedCourses

    return toResult({ teacher: teacher }, null)
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
          "Please provide valid user id or teacher id."
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`getATeacherDetails(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Get the total number of teachers.
 * Total teachers in the database.
 */
async function getAllTeachersCount() {
  try {
    const total = await db.teacher.count()

    const result = {
      total: total,
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
      logger.warn(`getAllTeachersCount(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}
/**
 * Delete a teacher from db
 * @param {*} teacherId
 * @returns - deleted teacher details or corresponding error
 */

async function deleteTeacher(teacherId) {
  try {
    const userDetails = await db.teacher.findFirstOrThrow({
      where: { id: teacherId },
    })

    // all other user related details should be deleted automatically
    const teacher = await db.user.delete({
      where: { id: userDetails.userId },
      include: { Teacher: true },
    })

    // delte password entry from data
    if (teacher.password) {
      delete teacher.password
    }

    return toResult(teacher, null)
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
      logger.warn(`deleteTeacher(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Import data in bulk
 * @param {*} data
 * @returns
 */
async function importTeachers(data) {
  try {
    let validQueries = []
    let invalidQueries = []

    for (const record of data) {
      const hash = hashPassword(record.contactNo)
      const teacher = await addTeacherWithUser(
        record.email,
        hash,
        record.name,
        record.address,
        record.contactNo,
        true,
        false
      )

      if (teacher.err !== null) {
        console.log(teacher.err)
        invalidQueries.push(record)
      } else {
        validQueries.push(teacher.result)
      }
    }
    return toResult(
      { validQueries: validQueries, invalidQueries: invalidQueries },
      null
    )
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
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something wrong with the data. ${err.message}`)
      )
    } else {
      logger.warn(`importStudents(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

module.exports = {
  listAllTeachers,
  listTeachersBy,
  getATeacherDetails,
  getAllTeachersCount,
  deleteTeacher,
  importTeachers,
}
