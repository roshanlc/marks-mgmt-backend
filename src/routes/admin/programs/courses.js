const { Router } = require("express")
const router = Router()
const {
  responseStatusCode,
  errorResponse,
  badRequestError,
} = require("../../../helper/error")
const Joi = require("joi")
const { escapeColon } = require("../../../helper/utils")
const {
  addMarkWeightage,
  listAllMarkWeightage,
  addCourse,
  updateCourse,
  deleteCourse,
  addCourseToSyllabus,
  removeCourseFromSyllabus,
} = require("../../../db/programs/courses")

// schema for faculty
const markWeightageSchema = Joi.object({
  theory: Joi.number().required().positive().max(100),
  practical: Joi.number().required().positive().max(100),
})

// fetch all mark weightage entries
router.get("/markweightage", async function (req, res) {
  const markWt = await listAllMarkWeightage()
  if (markWt.err !== null) {
    res.status(responseStatusCode.get(markWt.err.error.title)).json(markWt.err)
    return
  }

  res.status(200).json(markWt.result)
  return
})

// create a new markweightage
router.post("/markweightage", async function (req, res) {
  const err = markWeightageSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { theory, practical } = req.body
  const markWt = await addMarkWeightage(theory, practical)

  if (markWt.err !== null) {
    res.status(responseStatusCode.get(markWt.err.error.title)).json(markWt.err)
    return
  }

  res.status(201).json(markWt.result)
  return
})

const courseSchema = Joi.object({
  code: Joi.string().required().allow("").trim(),
  name: Joi.string().required().min(3).trim(),
  credit: Joi.number().required().positive().max(10),
  elective: Joi.boolean().default(false).required(),
  project: Joi.boolean().default(false).required(),
  markWeightageId: Joi.number().required().positive(),
})

// add a new course
router.post("", async function (req, res) {
  const err = courseSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { code, name, credit, elective, project, markWeightageId } = req.body
  const newCourse = await addCourse(
    code,
    name,
    credit,
    elective,
    project,
    markWeightageId
  )

  if (newCourse.err !== null) {
    res
      .status(responseStatusCode.get(newCourse.err.error.title))
      .json(newCourse.err)
    return
  }

  res.status(201).json(newCourse.result)
})

// update a course
router.put("/:id", async function (req, res) {
  const courseId = Number(req.params.id) || 0

  if (courseId === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  const err = courseSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { code, name, credit, elective, project, markWeightageId } = req.body
  const course = await updateCourse(
    courseId,
    code,
    name,
    credit,
    elective,
    project,
    markWeightageId
  )

  if (course.err !== null) {
    res.status(responseStatusCode.get(course.err.error.title)).json(course.err)
    return
  }

  res.status(200).json(course.result)
})

// delete a course
router.delete("/:id", async function (req, res) {
  const courseId = Number(req.params.id) || 0

  if (courseId === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  const course = await deleteCourse(courseId)

  if (course.err !== null) {
    res.status(responseStatusCode.get(course.err.error.title)).json(course.err)
    return
  }

  res.status(200).json(course.result)
})

const assignCourseSchema = Joi.object({
  programId: Joi.number().required().positive(),
  syllabusId: Joi.number().required().positive(),
  semesterId: Joi.number().required().positive(),
})

// Assign a course to a program syllabus
router.post("/:id/assign", async function (req, res) {
  const courseId = Number(req.params.id) || 0

  if (courseId === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  // validate schema
  const err = assignCourseSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // assign course to a program syllabus
  const { programId, syllabusId, semesterId } = req.body
  const assign = await addCourseToSyllabus(
    courseId,
    programId,
    syllabusId,
    semesterId
  )

  // check for error
  if (assign.err !== null) {
    res.status(responseStatusCode.get(assign.err.error.title)).json(assign.err)
    return
  }

  res.status(201).json(assign.result)
  return
})

// Remove a course from a program syllabus
router.delete("/:id/remove", async function (req, res) {
  const courseId = Number(req.params.id) || 0

  if (courseId === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  // validate schema
  const err = assignCourseSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // assign course to a program syllabus
  const { programId, syllabusId, semesterId } = req.body
  const removeCourse = await removeCourseFromSyllabus(
    courseId,
    programId,
    syllabusId,
    semesterId
  )

  // check for error
  if (removeCourse.err !== null) {
    res
      .status(responseStatusCode.get(removeCourse.err.error.title))
      .json(removeCourse.err)
    return
  }

  res.status(200).json(removeCourse.result)
  return
})
module.exports = router
