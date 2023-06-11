/**
 * This module contains controllers for fetching student details by an admin
 */
const { Router } = require("express")
const router = Router()
const { responseStatusCode } = require("../../helper/error")
const studentsDb = require("../../db/students/students")

// Get count of  students
router.get("/count", async function (req, res) {
  console.log("inside count")
  const facultyId = Number(req.query.faculty_id) || 0
  const departmentId = Number(req.query.dept_id) || 0
  const programId = Number(req.query.program_id) || 0
  const syllabusId = Number(req.query.syllabus_id) || 0
  const status = req.query.status || "ACTIVE"

  let count = {}

  if (
    programId === 0 &&
    syllabusId === 0 &&
    departmentId === 0 &&
    facultyId === 0 &&
    status === "ACTIVE"
  ) {
    console.log("for all")
    count = await studentsDb.getAllStudentsCount()
  } else {
    console.log("for specific")

    count = await studentsDb.getStudentsCountBy(
      facultyId,
      departmentId,
      programId,
      syllabusId,
      status
    )
  }

  if (count.err !== null) {
    res
      .status(responseStatusCode.get(count.err.error.title) || 400)
      .json(count.err)
    return
  }

  res.status(200).json(count.result)
})

// list all students
router.get("/", async function (req, res) {
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
