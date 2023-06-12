/**
 * This module contains controllers for fetching student details by an admin
 */
const { Router } = require("express")
const router = Router()
const { responseStatusCode, errorResponse } = require("../../helper/error")
const studentsDb = require("../../db/students/students")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const { addStudentWithUser } = require("../../db/users/user")
const { hashPassword } = require("../../helper/password")

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

// schema for the new student payload
const newStudentSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required().trim().min(5).max(50),
  programId: Joi.number().required().min(1),
  syllabusId: Joi.number().required().min(1),
  semester: Joi.number().required().min(1),
  name: Joi.string().required().trim().min(3),
  address: Joi.string().trim(),
  contactNo: Joi.string().trim(),
  symbolNo: Joi.string().required().trim(),
  puRegNo: Joi.string().required().trim(),
})

// Add a new student
router.post("/", async function (req, res) {
  const err = newStudentSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const {
    email,
    password,
    programId,
    syllabusId,
    semester,
    name,
    address,
    contactNo,
    symbolNo,
    puRegNo,
  } = req.body

  // hash of the password

  const hash = hashPassword(password)

  const newStudent = await addStudentWithUser(
    email,
    hash,
    name,
    address,
    contactNo,
    true,
    false,
    symbolNo,
    puRegNo,
    semester,
    programId,
    syllabusId,
    "ACTIVE"
  )

  if (newStudent.err !== null) {
    res
      .status(responseStatusCode.get(newStudent.err.error.title))
      .json(newStudent.err)
    return
  }

  res.status(201).json(newStudent.result)
  return
})

module.exports = router
