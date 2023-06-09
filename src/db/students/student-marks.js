/**
 * This module contains db functions related to marks viewing, editing and deleting
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const { errorResponse, internalServerError } = require("../../helper/error")
const { toResult } = require("../../helper/result")

/**
 * Returns all the marks of a student grouped by semester
 * @param {Number} studentId
 * @returns all the marks of a student upto the current semester
 */
async function getStudentMarks(studentId) {
  try {
    // fetch student details
    const studentDetails = await db.student.findFirstOrThrow({
      where: { id: studentId },
      include: {
        program: { select: { name: true, department: true, level: true } },
      },
    })

    //extract student semester id and syllabus id
    const currentSem = studentDetails.semesterId
    const syllabusId = studentDetails.syllabusId

    // Object to store student details and semester wise result
    // This object will be returned at the end
    const studentMarksObj = { student: studentDetails, semesters: [] }

    // Create a map to store semester wise marks
    const semMarks = new Map()

    for (let i = 1; i <= currentSem; i++) {
      semMarks.set(i, [])
    }

    // Extract list of courses in semester wise fashion for the user's program

    const programCourses = await db.programCourses.findMany({
      where: {
        AND: {
          programId: studentDetails.programId,
          syllabusId: syllabusId,
          semesterId: { lte: currentSem },
        },
      },
      include: { course: true },
    })

    // Now, the result upto this semester will fetched
    // i.e. 1 to N semesters
    const studentMarks = await db.studentMarks.findMany({
      where: { studentId: studentId },
    })

    for (let i = 0; i < programCourses.length; i++) {
      // create a marks object having course and marks details
      const marksObj = { ...programCourses[i], marks: {} }

      for (let j = 0; j < studentMarks.length; j++) {
        // If the marks is already used by another, skip
        if (studentMarks[j].done) {
          continue
        }
        if (programCourses[i].courseId === studentMarks[j].courseId) {
          marksObj.marks = studentMarks[j]

          // set done to true for marks
          studentMarks[j].done = true
          break
        }
      }
      semMarks.get(programCourses[i].semesterId).push(marksObj)
    }

    // loop through semesters map
    semMarks.forEach((val, key) => {
      studentMarksObj.semesters.push({ semester: key, courses: [...val] })
    })
    return toResult(studentMarksObj, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "Please provide valid student id.")
      )
    } else {
      logger.warn(`getStudentMarks(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * Returns all the marks of a student for a semester
 * @param {Number} studentId
 * @returns all the marks of a student for a semester
 */
async function getStudentMarksBySemester(studentId, semesterId) {
  // TODO: ADD logic-  when a semester greater than program's max semester is given
  try {
    // fetch student details
    const studentDetails = await db.student.findFirstOrThrow({
      where: { id: studentId },
      include: {
        program: { select: { name: true, department: true, level: true } },
      },
    })

    //extract student semester id and syllabus id
    const currentSem = studentDetails.semesterId
    const syllabusId = studentDetails.syllabusId

    // if the provided semester id is greater than the current sem
    if (semesterId > currentSem) {
      toResult(
        null,
        errorResponse(
          "Not Found",
          "Please provide valid semester id for the student."
        )
      )
    }
    // Object to store student details and semester wise result
    // This object will be returned at the end
    const studentMarksObj = {
      student: studentDetails,
      semesters: [{ semester: semesterId, courses: [] }],
    }

    // Extract list of courses in semester wise fashion for the user's program

    const programCourses = await db.programCourses.findMany({
      where: {
        AND: {
          programId: studentDetails.programId,
          syllabusId: syllabusId,
          semesterId: semesterId,
        },
      },
      include: { course: true },
    })

    // Now, the result upto this semester will fetched
    // i.e. 1 to N semesters
    const studentMarks = await db.studentMarks.findMany({
      where: { studentId: studentId },
    })

    for (let i = 0; i < programCourses.length; i++) {
      // create a marks object having course and marks details
      const marksObj = { ...programCourses[i], marks: {} }

      for (let j = 0; j < studentMarks.length; j++) {
        // If the marks is already used by another, skip
        if (studentMarks[j].done) {
          continue
        }
        if (programCourses[i].courseId === studentMarks[j].courseId) {
          marksObj.marks = studentMarks[j]

          // set done to true for marks
          studentMarks[j].done = true
          break
        }
      }
      // Only semester object is the provided semester
      studentMarksObj.semesters[0].courses.push(marksObj)
    }

    return toResult(studentMarksObj, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "Please provide valid student id.")
      )
    } else {
      logger.warn(`getStudentMarksBySemester(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

/**
 * Returns  the marks of a student for a course
 * @param {Number} studentId
 * @returns marks of a student for a course
 */
async function getStudentMarksByCourse(
  studentId,
  courseCode = "",
  courseName = ""
) {
  try {
    // fetch student details
    const studentDetails = await db.student.findFirstOrThrow({
      where: { id: studentId },
      include: {
        program: { select: { name: true, department: true, level: true } },
      },
    })

    //extract student's syllabus id

    const syllabusId = studentDetails.syllabusId

    // Object to store student details and semester wise result
    // This object will be returned at the end
    const studentMarksObj = { student: studentDetails, courses: [] }

    // Get the course details from it's code or name
    const programCourses = await db.programCourses.findFirstOrThrow({
      where: {
        AND: {
          programId: studentDetails.programId,
          syllabusId: syllabusId,
          course: { OR: [{ code: courseCode }, { name: courseName }] },
        },
      },
      include: { course: true },
    })

    // Now, the result for the course will be fetched
    const studentMarks = await db.studentMarks.findFirstOrThrow({
      where: { studentId: studentId },
    })

    // course details and marks
    const courseAndMarks = { ...programCourses, marks: studentMarks }

    // set the marks
    studentMarksObj.courses[0] = courseAndMarks

    return toResult(studentMarksObj, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(null, errorResponse("Not Found", err.message))
    } else {
      logger.warn(`getStudentMarks(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

module.exports = {
  getStudentMarks,
  getStudentMarksBySemester,
  getStudentMarksByCourse,
}
