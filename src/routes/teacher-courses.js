/**
 * This module contains controllers for teacher's courses related
 */
const { Router } = require("express")
const router = Router()
const { extractTokenDetails } = require("../helper/extract-token")
const { responseStatusCode } = require("../helper/error")
const userDB = require("../db/user")
const { getTeacherCourses } = require("../db/teacher-courses")

// Endpoint for student fetch their marks
router.get("/courses", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)
  // get student id
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

module.exports = router
