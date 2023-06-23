/**
 * This module contains controllers for teacher's courses related endpoints
 */
const { Router } = require("express")
const router = Router()
const { extractTokenDetails } = require("../../helper/extract-token")
const {
  responseStatusCode,
  errorResponse,
  forbiddenError,
} = require("../../helper/error")
const userDB = require("../../db/users/user")
const {
  getTeacherCourses,
  isTaughtBy,
  addMarksByTeacher,
  viewMarksByTeacher,
  updateMarksOfStudent,
  updateMarksOfAllStudentsForCourse,
  addMarksOfAllStudentsForCourse,
} = require("../../db/teachers/teacher-courses")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const { getAStudentDetails } = require("../../db/students/students")
const { array } = require("joi")
const { getStudentMarksByCourse } = require("../../db/students/student-marks")

// Endpoint for teacher to fetch courses they teach
router.get("/courses", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)
  // get teacher id
  const teacherId = await userDB.getTeacherId(tokenDetails.id)

  if (teacherId.err !== null) {
    res
      .status(responseStatusCode.get(teacherId.err.error.title) || 400)
      .json(teacherId.err)
    return
  }

  const teacherCourses = await getTeacherCourses(teacherId.result.id)

  if (teacherCourses.err !== null) {
    res
      .status(responseStatusCode.get(teacherCourses.err.error.title) || 400)
      .json(teacherCourses.err)
    return
  }

  // return courses taught by a teacher
  res.status(200).json(teacherCourses.result)
  return
})

const addMarksSchema = Joi.object({
  studentId: Joi.number().min(0).required(),
  theory: Joi.number().min(0).max(100).required(),
  practical: Joi.number().min(0).max(100).required(),
  courseId: Joi.number().min(0).required(),
  notQualified: Joi.boolean().default(false).required(),
})

// Endpoint for teacher to add marks of a student for a course
router.post("/marks", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)
  // get teacher id
  const teacherId = await userDB.getTeacherId(tokenDetails.id)

  if (teacherId.err !== null) {
    res
      .status(responseStatusCode.get(teacherId.err.error.title) || 400)
      .json(teacherId.err)
    return
  }

  const err = addMarksSchema.validate(req.body).error
  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // request body json
  const details = req.body

  // get student details (programId)

  const studentDetails = await getAStudentDetails(0, details.studentId)
  if (studentDetails.err !== null) {
    res
      .status(responseStatusCode.get(studentDetails.err.error.title) || 400)
      .json(studentDetails.err)
    return
  }

  // does this teacher teache the course taught by the student
  const teaches = await isTaughtBy(
    teacherId.result.id,
    studentDetails.programId,
    details.courseId
  )

  if (teaches.err !== null) {
    res
      .status(responseStatusCode.get(teaches.err.error.title) || 400)
      .json(teaches.err)
    return
  }

  // check if the course is taught by this teacher
  if (!teaches.result) {
    res.status(403).json(forbiddenError())
    return
  }
  // Now add the marks

  const marksAddition = await addMarksByTeacher(
    teacherId.result.id,
    details.studentId,
    details.courseId,
    details.theory,
    details.practical,
    details.notQualified
  )

  if (marksAddition.err !== null && marksAddition.err !== undefined) {
    res
      .status(responseStatusCode.get(marksAddition.err.error.title) || 400)
      .json(marksAddition.err)
    return
  }

  // successfully created resource
  res.status(201).json(marksAddition.result)
  return
})

// Endpoint for teacher to view marks of all students for a course
router.get("/marks/all", async function (req, res) {
  const courseId = Number(req.query.course_id) || 0
  const programId = Number(req.query.program_id) || 0
  if (courseId === 0 || programId === 0) {
    res
      .status(400)
      .json(errorResponse("Bad Request", "Insufficient request parameters."))
    return
  }
  const tokenDetails = extractTokenDetails(req)
  // get teacher id
  const teacherId = await userDB.getTeacherId(tokenDetails.id)

  if (teacherId.err !== null) {
    res
      .status(responseStatusCode.get(teacherId.err.error.title) || 400)
      .json(teacherId.err)
    return
  }

  // does this teacher teach this course
  const teaches = await isTaughtBy(teacherId.result.id, programId, courseId)

  if (teaches.err !== null) {
    res
      .status(responseStatusCode.get(teaches.err.error.title) || 400)
      .json(teaches.err)
    return
  }
  // check if the course is taught by this teacher
  if (!teaches.result) {
    res.status(403).json(forbiddenError())
    return
  }

  const marks = await viewMarksByTeacher(
    teacherId.result.id,
    courseId,
    programId
  )
  if (marks.err !== null) {
    res
      .status(responseStatusCode.get(marks.err.error.title) || 400)
      .json(marks.err)
    return
  }

  res.status(200).json(marks.result)
  return
})

// Endpoint for teacher to update marks of a student for a course
router.put("/marks", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)
  // get teacher id
  const teacherId = await userDB.getTeacherId(tokenDetails.id)

  if (teacherId.err !== null) {
    res
      .status(responseStatusCode.get(teacherId.err.error.title) || 400)
      .json(teacherId.err)
    return
  }

  const err = addMarksSchema.validate(req.body).error
  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // request body json
  const details = req.body

  // get student details (programId)

  const studentDetails = await getAStudentDetails(0, details.studentId)
  if (studentDetails.err !== null) {
    res
      .status(responseStatusCode.get(studentDetails.err.error.title) || 400)
      .json(studentDetails.err)
    return
  }

  // does this teacher teache the course taught by the student
  const teaches = await isTaughtBy(
    teacherId.result.id,
    studentDetails.programId,
    details.courseId
  )

  if (teaches.err !== null) {
    res
      .status(responseStatusCode.get(teaches.err.error.title) || 400)
      .json(teaches.err)
    return
  }

  // check if the course is taught by this teacher
  if (!teaches.result) {
    res.status(403).json(forbiddenError())
    return
  }

  // Now update the marks
  const marksAddition = await updateMarksOfStudent(
    details.studentId,
    details.courseId,
    details.theory,
    details.practical,
    details.notQualified
  )

  if (marksAddition.err !== null && marksAddition.err !== undefined) {
    res
      .status(responseStatusCode.get(marksAddition.err.error.title) || 400)
      .json(marksAddition.err)
    return
  }

  // successfully created resource
  res.status(200).json(marksAddition.result)
  return
})

const allStudentsMarksSchema = Joi.object({
  courseId: Joi.number().integer().positive().required(),
  programId: Joi.number().integer().positive().required(),

  marks: Joi.array()
    .items(
      Joi.object({
        studentId: Joi.number().integer().positive().required(),
        theory: Joi.number().integer().min(0).max(100).required(),
        practical: Joi.number().integer().min(0).max(100).required(),
        notQualified: Joi.boolean().default(false).required(),
      })
    )
    .required(),
})

// endpoint for teacher to update marks for all students enrolled in a course
router.put("/marks/all", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)
  // get teacher id
  const teacherId = await userDB.getTeacherId(tokenDetails.id)

  if (teacherId.err !== null) {
    res
      .status(responseStatusCode.get(teacherId.err.error.title) || 400)
      .json(teacherId.err)
    return
  }

  const err = allStudentsMarksSchema.validate(req.body).error
  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { courseId, programId, marks } = req.body

  // does this teacher teach the given course
  const teaches = await isTaughtBy(teacherId.result.id, programId, courseId)

  if (teaches.err !== null) {
    res
      .status(responseStatusCode.get(teaches.err.error.title) || 400)
      .json(teaches.err)
    return
  }

  // check if the course is taught by this teacher
  if (!teaches.result) {
    res.status(403).json(forbiddenError())
    return
  }
  const updatedMarks = await updateMarksOfAllStudentsForCourse(courseId, marks)

  if (updatedMarks.err !== null) {
    res
      .status(responseStatusCode.get(updatedMarks.err.error.title) || 400)
      .json(updatedMarks.err)
    return
  }

  res.status(200).json(updatedMarks.result)
  return
})

// endpoint for teacher to create marks for all students enrolled in a course
router.post("/marks/all", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)
  // get teacher id
  const teacherId = await userDB.getTeacherId(tokenDetails.id)

  if (teacherId.err !== null) {
    res
      .status(responseStatusCode.get(teacherId.err.error.title) || 400)
      .json(teacherId.err)
    return
  }

  const err = allStudentsMarksSchema.validate(req.body).error
  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { courseId, programId, marks } = req.body

  // does this teacher teach the given course
  const teaches = await isTaughtBy(teacherId.result.id, programId, courseId)

  if (teaches.err !== null) {
    res
      .status(responseStatusCode.get(teaches.err.error.title) || 400)
      .json(teaches.err)
    return
  }

  // check if the course is taught by this teacher
  if (!teaches.result) {
    res.status(403).json(forbiddenError())
    return
  }
  const createdMarks = await addMarksOfAllStudentsForCourse(
    teacherId.result.id,
    courseId,
    marks
  )

  if (createdMarks.err !== null) {
    res
      .status(responseStatusCode.get(createdMarks.err.error.title) || 400)
      .json(createdMarks.err)
    return
  }

  res.status(200).json(createdMarks.result)
  return
})

// Endpoint for teacher to view marks of a student for a course
router.get("/marks", async function (req, res) {
  const courseId = Number(req.query.course_id) || 0
  const studentId = Number(req.query.student_id) || 0
  if (courseId === 0 || studentId === 0) {
    res
      .status(400)
      .json(errorResponse("Bad Request", "Insufficient request parameters."))
    return
  }
  const tokenDetails = extractTokenDetails(req)
  // get teacher id
  const teacherId = await userDB.getTeacherId(tokenDetails.id)

  if (teacherId.err !== null) {
    res
      .status(responseStatusCode.get(teacherId.err.error.title) || 400)
      .json(teacherId.err)
    return
  }

  const student = await getAStudentDetails(0, studentId)
  if (student.err !== null) {
    res
      .status(responseStatusCode.get(student.err.error.title) || 400)
      .json(student.err)
    return
  }

  // does this teacher teach this course
  const teaches = await isTaughtBy(
    teacherId.result.id,
    student.result.programId,
    courseId
  )

  if (teaches.err !== null) {
    res
      .status(responseStatusCode.get(teaches.err.error.title) || 400)
      .json(teaches.err)
    return
  }
  // check if the course is taught by this teacher
  if (!teaches.result) {
    res.status(403).json(forbiddenError())
    return
  }

  const marks = await getStudentMarksByCourse(studentId, "", "", courseId)
  if (marks.err !== null) {
    res
      .status(responseStatusCode.get(marks.err.error.title) || 400)
      .json(marks.err)
    return
  }

  res.status(200).json(marks.result)
  return
})

module.exports = router
