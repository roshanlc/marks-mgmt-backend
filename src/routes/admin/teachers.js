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
const {
  getAllTeachersCount,
  listAllTeachers,
  listTeachersBy,
  getATeacherDetails,
  deleteTeacher,
} = require("../../db/teachers/teachers")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const { hashPassword } = require("../../helper/password")
const { addTeacherWithUser } = require("../../db/users/user")

// Get count of teachers
router.get("/count", async function (req, res) {
  const count = await getAllTeachersCount()

  if (count.err !== null) {
    res
      .status(responseStatusCode.get(count.err.error.title) || 400)
      .json(count.err)
    return
  }

  res.status(200).json(count.result)
})

// list all teachers
router.get("/", async function (req, res) {
  const programId = Number(req.query.program_id) || 0
  const departmentId = Number(req.query.dept_id) || 0

  let allTeachers = {}

  if (programId === 0 && departmentId === 0) {
    allTeachers = await listAllTeachers()

    if (allTeachers.err !== null) {
      res
        .status(responseStatusCode.get(allTeachers.err.error.title) || 400)
        .json(allTeachers.err)
      return
    }

    res.status(200).json(allTeachers.result)
    return
  }

  allTeachers = await listTeachersBy(programId, departmentId)

  if (allTeachers.err !== null) {
    res
      .status(responseStatusCode.get(allTeachers.err.error.title) || 400)
      .json(allTeachers.err)
    return
  }

  res.status(200).json(allTeachers.result)
})

// get a teacher detail
router.get("/:id", async function (req, res) {
  const id = Number(req.params.id) || 0
  if (id <= 0) {
    res.status(400).json(badRequestError("Please provide a valid teacher id"))
    return
  }

  const teacher = await getATeacherDetails(id, id)

  if (teacher.err !== null) {
    res
      .status(responseStatusCode.get(teacher.err.error.title) || 400)
      .json(teacher.err)
    return
  }

  res.status(200).json(teacher.result)
})

// schema for the new teacher payload
const newTeacherSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required().trim().min(5).max(50),
  name: Joi.string().required().trim().min(3),
  address: Joi.string().trim(),
  contactNo: Joi.string().trim(),
})

// create a new teacher
router.post("/", async function (req, res) {
  const err = newTeacherSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // extract from valid request body
  const { email, password, name, address, contactNo } = req.body

  // hash of the password
  const hash = hashPassword(password)

  const newTeacher = await addTeacherWithUser(
    email,
    hash,
    name,
    address,
    contactNo,
    true,
    false
  )

  if (newTeacher.err !== null) {
    res
      .status(responseStatusCode.get(newTeacher.err.error.title))
      .json(newTeacher.err)
    return
  }

  res.status(201).json(newTeacher.result)
  return
})

// delete a teacher account
router.delete("/:id", async function (req, res) {
  const id = Number(req.params.id) || 0
  if (id <= 0) {
    res.status(400).json(badRequestError("Please provide a valid teacher id"))
    return
  }

  const teacher = await deleteTeacher(id)

  if (teacher.err !== null) {
    res
      .status(responseStatusCode.get(teacher.err.error.title) || 400)
      .json(teacher.err)
    return
  }

  res.status(200).json(teacher.result)
})

module.exports = router
