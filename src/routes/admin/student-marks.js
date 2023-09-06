/**
 * This module contains controllers for fetching student marks by an admin
 */
const { Router } = require("express")
const router = Router()
const {
  responseStatusCode,
  errorResponse,
  badRequestError,
  internalServerError,
} = require("../../helper/error")
const {
  getAllStudentMarks,
  getStudentMarks,
  getStudentMarksBySemester,
  importStudentMarks,
} = require("../../db/students/student-marks")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const { updateMarksOfStudent } = require("../../db/teachers/teacher-courses")
const { getAStudentDetails } = require("../../db/students/students")
const fs = require("fs")
const os = require("os")
const multer = require("multer")
const { parse, CsvError } = require("csv-parse/sync")

// list all students' marks
router.get("/", async function (req, res) {
  const programId = Number(req.query.program_id) || 0
  const semesterId = Number(req.query.semester) || 0
  const yearJoined = Number(req.query.year_joined) || 0
  const batchId = Number(req.query.batch_id) || 0
  const departmentId = Number(req.query.dept_id) || 0

  if (
    programId < 0 ||
    semesterId < 0 ||
    yearJoined < 0 ||
    batchId < 0 ||
    departmentId < 0
  ) {
    res
      .status(400)
      .json(errorResponse("Bad Request", "Invalid parameters value"))
    return
  }
  const allStudents = await getAllStudentMarks(
    batchId,
    yearJoined,
    semesterId,
    programId,
    departmentId
  )

  if (allStudents.err !== null) {
    res
      .status(responseStatusCode.get(allStudents.err.error.title) || 400)
      .json(allStudents.err)
    return
  }

  res.status(200).json(allStudents.result)
})

// get a student's marks
router.get("/:student_id", async function (req, res) {
  const studentId = Number(req.params.student_id) || 0
  const semesterId = Number(req.query.semester) || 0

  if (studentId < 0) {
    res
      .status(400)
      .json(errorResponse("Bad Request", "Invalid student id value"))
    return
  }
  let marks = {}
  if (semesterId === 0) {
    marks = await getStudentMarks(studentId)
  } else {
    marks = await getStudentMarksBySemester(studentId, semesterId)
  }

  if (marks.err !== null) {
    res
      .status(responseStatusCode.get(marks.err.error.title) || 400)
      .json(marks.err)
    return
  }

  res.status(200).json(marks.result)
})

const addMarksSchema = Joi.object({
  studentId: Joi.number().min(0).required(),
  theory: Joi.number().min(0).max(100).required(),
  practical: Joi.number().min(0).max(100).required(),
  courseId: Joi.number().min(0).required(),
  notQualified: Joi.boolean().default(false).optional(),
  absent: Joi.boolean().default(false).optional(),
  expelled: Joi.boolean().default(false).optional(),
})

// update marks of a student for a course
router.put("/", async function (req, res) {
  const err = addMarksSchema.validate(req.body).error
  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // request body json
  const details = req.body

  // Now update the marks
  const marksAddition = await updateMarksOfStudent(
    details.studentId,
    details.courseId,
    details.theory,
    details.practical,
    details.notQualified,
    details.absent,
    details.expelled
  )

  if (marksAddition.err !== null && marksAddition.err !== undefined) {
    res
      .status(responseStatusCode.get(marksAddition.err.error.title) || 400)
      .json(marksAddition.err)
    return
  }

  // successfully created resource
  res.status(200).json(marksAddition.result)
  return
})

// Configure multer storage and file size limit
const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1.1, // 1 MB file size limit
    files: 1,
  },
})

// Import student details as csv file
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json(badRequestError("No file field found."))
      return
    }

    const file = req.file

    // check for mimetype
    if (
      file.mimetype !== "text/csv" &&
      file.mimetype !== "application/vnd.ms-excel"
    ) {
      res.status(400).json(badRequestError("Only CSV file is allowed."))
      return
    }

    // read file
    const data = fs.readFileSync(file.path)

    // parse csv
    const records = parse(data, {
      columns: true,
      delimiter: ",",
      autoParse: true,
      skip_empty_lines: true,
      trim: true,
      skip_records_with_empty_values: true,
    })

    const students = await importStudentMarks(records)

    // check for error
    if (students.err !== null) {
      res
        .status(responseStatusCode.get(students.err.error.title))
        .json(students.err)
    } else {
      res.status(201).send(students.result)
    }
    // delete the file
    fs.unlinkSync(file.path)

    return
  } catch (err) {
    if (err instanceof CsvError && err.code === "INVALID_OPENING_QUOTE") {
      res
        .status(400)
        .json(badRequestError("Only a proper CSV file is allowed."))
      return
    }
    console.log(err)
    res.send(internalServerError())
  }
})

module.exports = router
