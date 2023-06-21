const { Router } = require("express")
const router = Router()
const { responseStatusCode, errorResponse } = require("../../../helper/error")
const Joi = require("joi")
const { escapeColon } = require("../../../helper/utils")
const {
  addMarkWeightage,
  listAllMarkWeightage,
  addCourse,
  updateCourse,
  deleteCourse,
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

  const course = await deleteCourse(courseId)

  if (course.err !== null) {
    res.status(responseStatusCode.get(course.err.error.title)).json(course.err)
    return
  }

  res.status(200).json(course.result)
})
module.exports = router
