/**
 * This module contains controllers for student's marks related endpoints
 */
const { Router } = require("express")
const router = Router()
const { extractTokenDetails } = require("../helper/extract-token")
const { responseStatusCode, forbiddenError } = require("../helper/error")
const { hasRole } = require("../db/roles")

// Endpoint for student fetch their marks
router.get("/marks", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)
  const roles = tokenDetails.user.UserRoles

  // Incase the user is not a student, return forbidden error
  if (!roles.includes("student")) {
    res.status(403).json(forbiddenError())
    return
  }

  const semester = req.query.semester || 0
  const courseName = courseName.query.course_name || ""
  const courseCode = courseName.query.course_code || ""

  // return user profile details
  res.status(200).send([semester, courseCode, courseName])
  return
})

module.exports = router
