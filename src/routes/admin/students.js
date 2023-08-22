/**
 * This module contains controllers for fetching student details by an admin
 */
const { Router } = require("express")
const router = Router()
const {
  responseStatusCode,
  errorResponse,
  badRequestError,
} = require("../../helper/error")
const studentsDb = require("../../db/students/students")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const { addStudentWithUser } = require("../../db/users/user")
const { hashPassword } = require("../../helper/password")

// Get count of  students
router.get("/count", async function (req, res) {
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

// Get list of distinct years joined of  students
router.get("/years", async function (req, res) {
  const years = await studentsDb.listAllYearsJoined()

  if (years.err !== null) {
    res
      .status(responseStatusCode.get(years.err.error.title) || 400)
      .json(years.err)
    return
  }

  res.status(200).json(years.result)
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
  const id = Number(req.params.id) || 0

  if (id <= 0) {
    res.status(400).json(badRequestError("Please provide a valid student id."))
    return
  }

  const allStudents = await studentsDb.getAStudentDetails(id, id)

  if (allStudents.err !== null) {
    res
      .status(responseStatusCode.get(allStudents.err.error.title) || 400)
      .json(allStudents.err)
    return
  }

  res.status(200).json(allStudents.result)
})

// delete a student
router.delete("/:id", async function (req, res) {
  const id = Number(req.params.id) || 0

  if (id <= 0) {
    res.status(400).json(badRequestError("Please provide a valid student id."))
    return
  }

  const student = await studentsDb.deleteStudent(id)
  if (student.err !== null) {
    res
      .status(responseStatusCode.get(student.err.error.title) || 400)
      .json(student.err)
    return
  }

  res.status(200).json(student.result)
  return
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

// update a student's details
router.put("/:id", async function (req, res) {
  const id = Number(req.params.id) || 0

  if (id <= 0) {
    res.status(400).json(badRequestError("Please provide a valid student id."))
    return
  }

  if (Object.keys(req.body).length === 0) {
    res
      .status(400)
      .json(badRequestError("Please provide a valid request body."))
    return
  }

  // requires custom validation since fields are optional
  let { semester, puRegNo, symbolNo, status } = req.body
  if (semester === undefined) {
    semester = 0
  } else if (Number(semester) <= 0) {
    res.status(400).json(badRequestError("Please provide a valid semester."))
    return
  }
  if (puRegNo === undefined) {
    puRegNo = ""
  }

  if (status === undefined) {
    status = ""
  }
  if (symbolNo === undefined || symbolNo === "") {
    symbolNo = ""
  } else if (isNaN(Number(symbolNo)) || Number(symbolNo) <= 0) {
    res.status(400).json(badRequestError("Please provide a valid symbol no."))
    return
  }

  const student = await studentsDb.updateStudentDetails(
    id,
    symbolNo,
    puRegNo,
    Number(semester),
    status
  )

  if (student.err !== null) {
    res
      .status(responseStatusCode.get(student.err.error.title) || 400)
      .json(student.err)
    return
  }

  res.status(200).json(student.result)
  return
})

module.exports = router
