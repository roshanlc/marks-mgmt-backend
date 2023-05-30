/**
 * This module contains controllers for student's marks related endpoints
 */
const { Router } = require("express")
const router = Router()
const { extractTokenDetails } = require("../helper/extract-token")
const { responseStatusCode } = require("../helper/error")
const marksDB = require("../db/student-marks")
const userDB = require("../db/user")
const { errorResponse } = require("../helper/error")

// Endpoint for student fetch their marks
router.get("/marks", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)

  const semester = Number(req.query.semester) || 0
  const courseName = req.query.course_name || ""
  const courseCode = req.query.course_code || ""

  if (semester !== 0 && (courseCode !== "" || courseName !== "")) {
    res
      .status(400)
      .json(
        errorResponse(
          "Bad Request",
          "You can only set either semester or course"
        )
      )
    return
  }

  // get student id
  const studentId = await userDB.getStudentId(tokenDetails.id)

  if (studentId.err !== null) {
    res
      .status(responseStatusCode.get(marks.err.title) || 400)
      .json(studentId.err)
    return
  }

  // When no queries are provided
  if (semester === 0 && courseCode === "" && courseName === "") {
    const marks = await marksDB.getStudentMarks(studentId.result.id)
    if (marks.err !== null) {
      res
        .status(responseStatusCode.get(marks.err.title) || 400)
        .json(studentId.err)
      return
    }

    // return marks of a student
    res.status(200).send(marks.result)
    return
  }

  // if semester value is provided
  if (semester !== 0) {
    if (semester < 0 || semester > 12) {
      res
        .status(400)
        .json(errorResponse("Bad Request", "Invalid semester value"))
      return
    }

    const marks = await marksDB.getStudentMarksBySemester(
      studentId.result.id,
      semester
    )

    if (marks.err !== null) {
      res
        .status(responseStatusCode.get(marks.err.title) || 400)
        .json(studentId.err)
      return
    }

    // return marks of a student
    res.status(200).send(marks.result)
    return
  }

  // search marks by course
  const marks = await marksDB.getStudentMarksByCourse(
    studentId.result.id,
    courseCode,
    courseName
  )

  if (marks.err !== null) {
    res.status(responseStatusCode.get(marks.err.title) || 400).json(marks.err)
    return
  }

  // return marks of a student
  res.status(200).send(marks.result)
  return
})

module.exports = router
