/**
 * This module contains controllers for fetching student details by an admin
 */
const { Router } = require("express")
const router = Router()
const {
  responseStatusCode,
  errorResponse,
  badRequestError,
  internalServerError,
} = require("../../helper/error")
const studentsDb = require("../../db/students/students")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const { addStudentWithUser } = require("../../db/users/user")
const { hashPassword } = require("../../helper/password")
const fs = require("fs")
const os = require("os")
const multer = require("multer")
const { parse, CsvError } = require("csv-parse/sync")

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
  const semesterId = Number(req.query.semester) || 0
  const yearJoined = Number(req.query.year_joined) || 0

  let allStudents = {}

  if (
    programId === 0 &&
    syllabusId === 0 &&
    departmentId === 0 &&
    semesterId == 0 &&
    yearJoined === 0
  ) {
    allStudents = await studentsDb.listAllStudents()
  } else {
    allStudents = await studentsDb.listStudentsBy(
      programId,
      syllabusId,
      departmentId,
      semesterId,
      yearJoined
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
  yearJoined: Joi.number().required().positive().min(1950),
  dateOfBirth: Joi.string().required().trim(),
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
    yearJoined,
    dateOfBirth,
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
    yearJoined,
    dateOfBirth,
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

    const students = await studentsDb.importStudents(records)

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
