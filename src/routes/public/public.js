/**
 * Contains public endpoints
 */
const { Router } = require("express")
const router = Router()
const { responseStatusCode, badRequestError } = require("../../helper/error")
const {
  getFaculties,
  getFacultyById,
  getDepartments,
  getDepartmentById,
  getPrograms,
  getProgramById,
  getSyllabusById,
  getAllSyllabus,
  getSyllabusOfProgram,
  getBatchById,
  listAllBatch,
  listAllLevels,
  getCurrentBatch,
} = require("../../db/programs/others")
const { listAllCourses, getCourse } = require("../../db/programs/courses")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const {
  getStudentMarks,
  getStudentMarksByDetails,
} = require("../../db/students/student-marks")

//get all faculties
router.get("/faculties", async function (req, res) {
  const faculties = await getFaculties()
  if (faculties.err !== null) {
    res
      .status(responseStatusCode.get(faculties.err.error.title) || 400)
      .json(faculties.err)
    return
  }

  res.status(200).json(faculties.result)
  return
})

//get an individual faculty
router.get("/faculties/:id", async function (req, res) {
  const { id } = req.params

  if (Number(id) === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  const faculties = await getFacultyById(Number(id) || 0)
  if (faculties.err !== null) {
    res
      // .header("Cache-Control", "public, max-age=604800")
      .status(responseStatusCode.get(faculties.err.error.title) || 400)
      .json(faculties.err)
    return
  }

  res.status(200).json(faculties.result)
  return
})

//get all departments
router.get("/departments", async function (req, res) {
  const depts = await getDepartments()
  if (depts.err !== null) {
    res
      .status(responseStatusCode.get(depts.err.error.title) || 400)
      .json(depts.err)
    return
  }

  res
    // .header("Cache-Control", "public, max-age=604800")
    .status(200)
    .json(depts.result)
  return
})

//get an individual department
router.get("/departments/:id", async function (req, res) {
  const { id } = req.params

  if (Number(id) === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  const dept = await getDepartmentById(Number(id) || 0)
  if (dept.err !== null) {
    res
      // .header("Cache-Control", "public, max-age=604800")
      .status(responseStatusCode.get(dept.err.error.title) || 400)
      .json(dept.err)
    return
  }

  res.status(200).json(dept.result)
  return
})

//get all programs
router.get("/programs", async function (req, res) {
  const programs = await getPrograms()
  if (programs.err !== null) {
    res
      // .header("Cache-Control", "public, max-age=604800")
      .status(responseStatusCode.get(programs.err.error.title) || 400)
      .json(programs.err)
    return
  }

  res.status(200).json(programs.result)
  return
})

//get an individual program
router.get("/programs/:id", async function (req, res) {
  const { id } = req.params

  if (Number(id) === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  const program = await getProgramById(Number(id) || 0)
  if (program.err !== null) {
    res
      .status(responseStatusCode.get(program.err.error.title) || 400)
      .json(program.err)
    return
  }

  res
    // .header("Cache-Control", "public, max-age=604800")
    .status(200)
    .json(program.result)
  return
})

//get all syllabus
router.get("/syllabus", async function (req, res) {
  const programId = Number(req.query.program_id) || 0
  let syallbus = {}
  if (programId > 0) {
    syallbus = await getSyllabusOfProgram(programId)
  } else {
    syallbus = await getAllSyllabus()
  }
  if (syallbus.err !== null) {
    res
      .status(responseStatusCode.get(syallbus.err.error.title) || 400)
      .json(syallbus.err)
    return
  }

  res
    // .header("Cache-Control", "public, max-age=604800")
    .status(200)
    .json(syallbus.result)
  return
})

//get an individual syllabus
router.get("/syllabus/:id", async function (req, res) {
  const { id } = req.params

  if (Number(id) === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  const syallbus = await getSyllabusById(Number(id) || 0)
  if (syallbus.err !== null) {
    res
      .status(responseStatusCode.get(syallbus.err.error.title) || 400)
      .json(syallbus.err)
    return
  }

  res
    // .header("Cache-Control", "public, max-age=604800")
    .status(200)
    .json(syallbus.result)
  return
})

//get all courses
router.get("/courses", async function (req, res) {
  const programId = Number(req.query.program_id) || 0
  const syllabusId = Number(req.query.syllabus_id) || 0

  const courses = await listAllCourses(programId, syllabusId)

  if (courses.err !== null) {
    res
      .status(responseStatusCode.get(courses.err.error.title) || 400)
      .json(courses.err)
    return
  }

  res
    // .header("Cache-Control", "public, max-age=604800")
    .status(200)
    .json(courses.result)
  return
})

//get a course
router.get("/courses/:id", async function (req, res) {
  const courseId = Number(req.params.id)

  if (courseId === 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }
  const courses = await getCourse(courseId)

  if (courses.err !== null) {
    res
      .status(responseStatusCode.get(courses.err.error.title) || 400)
      .json(courses.err)
    return
  }

  res
    // .header("Cache-Control", "public, max-age=604800")
    .status(200)
    .json(courses.result)
  return
})

// list all batch
router.get("/batch", async function (req, res) {
  const batch = await listAllBatch()

  if (batch.err !== null) {
    res.status(responseStatusCode.get(batch.err.error.title)).json(batch.err)
    return
  }

  res.status(200).json(batch.result)
  return
})

// current batch
router.get("/batch/current", async function (req, res) {
  const batch = await getCurrentBatch()

  if (batch.err !== null) {
    res.status(responseStatusCode.get(batch.err.error.title)).json(batch.err)
    return
  }

  res.status(200).json(batch.result)
  return
})

// get an individual batch
router.get("/batch/:id", async function (req, res) {
  const id = Number(req.params.id) || 0
  if (id === 0) {
    res.status(400).json(badRequestError("Please provide a valid batch id"))
  }
  const batch = await getBatchById(id)

  if (batch.err !== null) {
    res.status(responseStatusCode.get(batch.err.error.title)).json(batch.err)
    return
  }

  res.status(200).json(batch.result)
  return
})

// list all levels
router.get("/levels", async function (req, res) {
  const levels = await listAllLevels()

  if (levels.err !== null) {
    res.status(responseStatusCode.get(levels.err.error.title)).json(levels.err)
    return
  }

  res.status(200).json(levels.result)
  return
})

// schema for details
const details = Joi.object({
  email: Joi.string().email().required().trim(),
  symbolNo: Joi.string()
    .trim()
    .min(8)
    .max(20)
    .required("symbol_no is required"),
  puRegNo: Joi.string().trim().min(8).max(20).required("pu_reg is required"),
  dob: Joi.string().min(10).max(10).required("dob is required"),
})

// get student marks
router.get("/marks", async function (req, res) {
  const email = req.query.email || ""
  const symbolNo = req.query.symbol_no || ""
  const puRegNo = req.query.pu_reg || ""
  const dateOfBirth = req.query.dob || ""

  const data = {
    email: email,
    symbolNo: symbolNo,
    puRegNo: puRegNo,
    dob: dateOfBirth,
  }

  const err = details.validate(data).error
  if (err !== null) {
    if (err !== undefined && err !== null) {
      res.status(400).json(badRequestError(escapeColon(err.message)))
      return
    }
  }

  const marks = await getStudentMarksByDetails(
    email,
    dateOfBirth,
    symbolNo,
    puRegNo
  )

  if (marks.err !== null) {
    res.status(responseStatusCode.get(marks.err.error.title)).json(marks.err)
    return
  }

  res.status(200).json(marks.result)
  return
})
module.exports = router
