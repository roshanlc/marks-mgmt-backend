/**
 * This module contains db functions related to marks viewing, editing and deleting
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
const { courses } = require("../../helper/seeder/courses")
const { addMarksByTeacher } = require("../teachers/teacher-courses")

// cache for batches
const batchArray = []

// course cache
const courseArray = []

// student cache
const studentArray = []

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
      return toResult(null, internalServerError())
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
      return toResult(
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
      return toResult(null, internalServerError())
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
  courseName = "",
  courseId = 0
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
          course: {
            OR: [{ code: courseCode }, { name: courseName }, { id: courseId }],
          },
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
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Returns the syllabus of a student
 * @param {Number} studentId
 * @returns the syllabus of a student
 */
async function getStudentSyllabus(studentId) {
  try {
    // fetch student details
    const studentDetails = await db.student.findFirstOrThrow({
      where: { id: studentId },
      orderBy: { semesterId: "asc" },
      select: {
        syllabus: {
          include: {
            program: true,
            ProgramCourses: { include: { course: true } },
          },
        },
      },
    })

    return toResult(studentDetails, null)
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
      logger.warn(`getStudentSyllabus(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Inserts marks of a students for courses upto a given semester
 * @param {*} studentId
 * @param {*} from - start semester id
 * @param {*} to - end semester id
 * @param {*} batchId
 * @returns marks object or corresponding error
 */
async function createMarksForSemesters(studentId, from, to, batchId = 0) {
  try {
    const studentDetails = await db.student.findFirstOrThrow({
      where: { id: studentId },
      include: { program: { include: { ProgramSemesters: true } } },
    })

    const maxSem = studentDetails.program.ProgramSemesters[0].semesterId || 0

    if (maxSem === 0) {
      throw "Max semester for the sudent program found to be 0."
    } else if (to > maxSem) {
      return toResult(
        null,
        badRequestError(
          `Max semester for the program ${maxSem} is less than provided to semester ${to}`
        )
      )
    }

    // fetch program courses
    const programCourses = await db.programCourses.findMany({
      where: {
        syllabusId: studentDetails.syllabusId,
        semesterId: { gte: from, lte: to },
      },
    })

    let latestBatch = {}
    if (batchId === 0) {
      latestBatch = await getLatestBatch()
      if (latestBatch.err !== null) {
        return toResult(null, latestBatch.err)
      }
    }

    // fetch teacher courses for the program and latest batch
    const teacherCourses = await db.teacherCourses.findMany({
      where: {
        programId: studentDetails.programId,
        batchId: batchId > 0 ? batchId : latestBatch?.result?.id,
      },
    })

    const marks = []

    // create queries to create marks
    for (const course of programCourses) {
      // get teacher id for this course for the current batch
      const teacher = teacherCourses.filter(
        (x) => x.courseId === course.courseId
      )
      marks.push(
        db.studentMarks.create({
          data: {
            courseId: course.courseId,
            studentId: studentDetails.id,
            batchId: batchId > 0 ? batchId : null,
            theory: 0,
            practical: 0,
            NotQualified: false,
            teacherId: teacher.length > 0 ? teacher[0]?.teacherId : undefined,
          },
        })
      )
    }

    const result = await db.$transaction([...marks])

    return toResult(result, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.message))
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

/**
 * Delete marks of a student for a course
 * @param {*} studentId
 * @param {*} courseId
 * @returns deleted marks or corresponding error
 */
async function deleteMarksOfStudentForCourse(studentId, courseId) {
  try {
    if (courseId <= 0) {
      return toResult(null, badRequestError("Provide a valid course id"))
    }

    const deletedMarks = await db.studentMarks.deleteMany({
      where: {
        studentId: studentId,
        courseId: courseId,
      },
    })

    return toResult(deletedMarks, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.message))
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`deleteMarksOfStudentForCourse(): ${err}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Delte marks of a student for given semesters criteria
 * @param {*} studentId - id of student
 * @param {*} from - start semester
 * @param {*} to - end semester
 * @returns deleted marks or corresponding error
 */
async function deleteMarksOfStudentForSemesters(studentId, from, to) {
  try {
    const studentDetails = await db.student.findFirstOrThrow({
      where: { id: studentId },
      include: { program: { include: { ProgramSemesters: true } } },
    })

    // fetch max sem for the program student is enrolled
    const maxSem = studentDetails.program.ProgramSemesters[0].semesterId || 0

    if (maxSem === 0) {
      throw "Max semester for the sudent program found to be 0."
    } else if (to > maxSem) {
      return toResult(
        null,
        badRequestError(
          `Max semester for the program ${maxSem} is less than provided to semester ${to}`
        )
      )
    }

    // fetch program courses
    const programCourses = await db.programCourses.findMany({
      where: {
        syllabusId: studentDetails.syllabusId,
        semesterId: { gte: from, lte: to },
      },
    })

    // empty array to store marks deletion promises
    const marks = []

    // create queries to delete marks
    for (const course of programCourses) {
      marks.push(
        db.studentMarks.delete({
          where: {
            studentId_courseId: {
              studentId: studentDetails.id,
              courseId: course.courseId,
            },
          },
        })
      )
    }

    const result = await db.$transaction([...marks])

    return toResult(result, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(null, errorResponse("Not Found", err.meta.cause))
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`deleteMarksOfStudentForCourse(): ${err}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * List all the student marks in the db
 * @param {Number} batchId
 * @param {Number} yearJoined
 * @param {Number} semester
 * @param {Number} programId
 * @param {Number} deptId
 * @returns list of marks
 */
async function getAllStudentMarks(
  batchId = 0,
  yearJoined = 0,
  semester = 0,
  programId = 0,
  deptId = 0
) {
  try {
    // list marks using filters provided
    const studentMarks = await db.studentMarks.findMany({
      where: {
        batchId: batchId > 0 ? batchId : undefined,
        student: {
          AND: [
            { yearJoined: yearJoined > 0 ? yearJoined : undefined },
            { programId: programId > 0 ? programId : undefined },
            { program: { departmentId: deptId > 0 ? deptId : undefined } },
          ],
        },
        course: {
          ProgramCourses: {
            some: { semesterId: semester > 0 ? semester : undefined },
          },
        },
      },

      include: {
        batch: true,
        student: {
          include: {
            user: { select: { name: true, email: true, id: true } },
            program: true,
          },
        },
        course: { include: { ProgramCourses: true, markWeightage: true } },
      },
    })

    return toResult(studentMarks, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(null, errorResponse("Not Found", err.message))
    } else {
      logger.warn(`getAllStudentMarks(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Import marks data of students in bulk
 * @param {*} data
 * @returns
 */
async function importStudentMarks(data) {
  try {
    let validQueries = []
    let invalidQueries = []

    for (const record of data) {
      // batch details
      let batchDetails = {}

      const items = record?.batch?.trim().split(" ") || ""
      if (items !== "") {
        if (items.length !== 2) {
          invalidQueries.push(record)
          continue
        }

        const year = Number(items[0])

        if (year < 1980 && year > 2050) {
          invalidQueries.push(record)
          continue
        }
        const season = items[1].toUpperCase()

        batchDetails = await findOrCreateBatch(year, season)
      }

      // course details
      let courseDetails = {}

      const course = courseArray.filter(
        (course) =>
          course.name.trim().toLowerCase() ===
          record.course.trim().toLowerCase()
      )

      if (course.length === 0 || course === null) {
        courseDetails = await db.course.findFirst({
          where: { name: { contains: record.course, mode: "insensitive" } },
        })
        courseArray.push(courseDetails)
      } else {
        // the filtered array
        courseDetails = course[0]
      }

      try {
        const studentObj = studentArray.filter(
          (std) => std.symbolNo === record.symbolNo
        )

        let stdDetails = {}
        if (studentObj.length === 0 || studentObj === null) {
          stdDetails = await db.student.findFirst({
            where: { symbolNo: record.symbolNo },
          })

          if (stdDetails === undefined || stdDetails === null) {
            invalidQueries.push(record)
            continue
          }

          studentArray.push(stdDetails)
        } else {
          // the filtered array
          stdDetails = studentObj[0]
        }

        const nQ = record.notQualified.toLowerCase() === "yes" ? true : false
        const expelled = record.expelled.toLowerCase() === "yes" ? true : false
        const absent = record.absent.toLowerCase() === "yes" ? true : false

        const studentMarks = await db.studentMarks.upsert({
          where: {
            studentId_courseId: {
              studentId: stdDetails.id,
              courseId: courseDetails.id,
            },
          },

          create: {
            studentId: stdDetails.id,
            courseId: courseDetails.id,
            theory: Number(record.theory),
            practical: Number(record.practical),
            NotQualified: nQ,
            expelled: expelled,
            absent: absent,
            batchId: batchDetails === {} ? undefined : batchDetails.id,
          },
          update: {
            studentId: stdDetails.id,
            courseId: courseDetails.id,
            theory: Number(record.theory),
            practical: Number(record.practical),
            NotQualified: nQ,
            expelled: expelled,
            absent: absent,
            batchId: batchDetails === {} ? undefined : batchDetails.id,
          },
        })
        validQueries.push(studentMarks)
      } catch (err) {
        invalidQueries.push(record)
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
      logger.warn(`importStudentMarks(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

// create or find batch
async function findOrCreateBatch(year, season) {
  if (batchArray.length === 0) {
    const batch = await db.batch.findFirst({
      where: { AND: [{ year: year }, { season: season }] },
    })

    if (batch === undefined || batch === null) {
      const newBatch = await db.batch.create({
        data: { year: year, season: season, used: true },
      })

      // add to the cache
      batchArray.push(newBatch)
      return newBatch
    }
    batchArray.push(batch)
    return batch
  }

  const batchObj = batchArray.filter(
    (item) =>
      item.year === year && item.season.toUpperCase() === season.toUpperCase()
  )

  if (batchObj === undefined || batchObj.length === 0) {
    const batch = await db.batch.findFirst({
      where: { AND: [{ year: year }, { season: season }] },
    })

    if (batch === undefined || batch === null) {
      const newBatch = await db.batch.create({
        data: { year: year, season: season, used: true },
      })

      // add to the cache
      batchArray.push(newBatch)
      return newBatch
    }
    batchArray.push(batch)
    return batch
  }

  return batchObj[0]
}

// get student marks based on student details
async function getStudentMarksByDetails(email, dob, symbolNo, puRegNo) {
  try {
    // get student id from given details
    const student = await db.student.findFirstOrThrow({
      where: {
        symbolNo: symbolNo,
        puRegNo: puRegNo,
        dateOfBirth: dob,
        user: { email: email },
      },
    })

    // fetch marks
    const marks = await getStudentMarks(student.id)
    return marks
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
      logger.warn(`getStudentMarksByDetails(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}
module.exports = {
  getStudentMarks,
  getStudentMarksBySemester,
  getStudentMarksByCourse,
  getStudentSyllabus,
  createMarksForSemesters,
  deleteMarksOfStudentForCourse,
  deleteMarksOfStudentForSemesters,
  getAllStudentMarks,
  importStudentMarks,
  getStudentMarksByDetails,
}
