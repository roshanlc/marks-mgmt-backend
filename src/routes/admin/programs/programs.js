const { Router } = require("express")
const router = Router()
const { responseStatusCode, errorResponse } = require("../../../helper/error")
const Joi = require("joi")
const {
  addFaculty,
  addDepartment,
  addProgram,
  addSyllabus,
  addLevel,
} = require("../../../db/programs/programs")
const { escapeColon } = require("../../../helper/utils")

// schema for faculty
const facultySchema = Joi.object({
  name: Joi.string().required().trim().min(3),
  head: Joi.string().optional().allow("").trim(),
})

// create a new faculty
router.post("/faculty", async function (req, res) {
  const err = facultySchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { name, head } = req.body
  const faculty = await addFaculty(name, head)

  if (faculty.err !== null) {
    res
      .status(responseStatusCode.get(faculty.err.error.title))
      .json(faculty.err)
    return
  }

  res.status(201).json(faculty.result)
  return
})

// schema for department
const deptSchema = Joi.object({
  name: Joi.string().required().trim().min(3),
  head: Joi.string().optional().allow("").trim(),
  facultyId: Joi.number().required().min(1),
})

// create a new department
router.post("/department", async function (req, res) {
  const err = deptSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { name, head, facultyId } = req.body
  const dept = await addDepartment(name, head, facultyId)

  if (dept.err !== null) {
    res.status(responseStatusCode.get(dept.err.error.title)).json(dept.err)
    return
  }

  res.status(201).json(dept.result)
  return
})

// schema for program
const programSchema = Joi.object({
  name: Joi.string().required().trim().min(3),
  head: Joi.string().optional().allow("").trim(),
  departmentId: Joi.number().required().min(1),
  levelId: Joi.number().required().min(1),
})

// create a new department
router.post("/program", async function (req, res) {
  const err = programSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { name, head, departmentId, levelId } = req.body
  const program = await addProgram(name, head, departmentId, levelId)

  if (program.err !== null) {
    res
      .status(responseStatusCode.get(program.err.error.title))
      .json(program.err)
    return
  }

  res.status(201).json(program.result)
  return
})

// schema for syllabus
const syllabusSchema = Joi.object({
  name: Joi.string().required().trim().min(3),
  programId: Joi.number().required().min(1),
})

// create a new syllabus
router.post("/syllabus", async function (req, res) {
  const err = syllabusSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { name, programId } = req.body
  const syllabus = await addSyllabus(name, programId)

  if (syllabus.err !== null) {
    res
      .status(responseStatusCode.get(syllabus.err.error.title))
      .json(syllabus.err)
    return
  }

  res.status(201).json(syllabus.result)
  return
})

// schema for level
const levelSchema = Joi.object({
  name: Joi.string().required().trim().min(3),
})

// create a new level
router.post("/level", async function (req, res) {
  const err = levelSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { name } = req.body
  const level = await addLevel(name)

  if (level.err !== null) {
    res.status(responseStatusCode.get(level.err.error.title)).json(level.err)
    return
  }

  res.status(201).json(level.result)
  return
})

module.exports = router
