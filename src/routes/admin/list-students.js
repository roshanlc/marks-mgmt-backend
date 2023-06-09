/**
 * This module contains controllers for fetching student details by an admin
 */
const { Router } = require("express")
const router = Router()
const { responseStatusCode } = require("../../helper/error")
const studentsDb = require("../../db/students/students")

// list all students
router.get("", async function (req, res) {
  const programId = Number(req.query.program_id) || 0
  const syllabusId = Number(req.query.syllabus_id) || 0
  const departmentId = Number(req.query.dept_id) || 0

  let allStudents = {}

  if (programId === 0 && syllabusId === 0 && departmentId === 0) {
    allStudents = await studentsDb.listAllStudents()
  } else {
    allStudents = await studentsDb.listStudentsBy(
      programId,
      syllabusId,
      departmentId
    )
  }

  if (allStudents.err !== null) {
    res
      .status(responseStatusCode.get(allStudents.err.error.title) || 400)
      .json(allStudents.err)
    return
  }

  res.status(200).json(allStudents.result)
})

// get a student detail
router.get("/:id", async function (req, res) {
  const { id } = req.params
  const allStudents = await studentsDb.getAStudentDetails(
    Number(id) || 0,
    Number(id) || 0
  )

  if (allStudents.err !== null) {
    res
      .status(responseStatusCode.get(allStudents.err.error.title) || 400)
      .json(allStudents.err)
    return
  }

  res.status(200).json(allStudents.result)
})

module.exports = router
