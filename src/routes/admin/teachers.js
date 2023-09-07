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
const {
  getAllTeachersCount,
  listAllTeachers,
  listTeachersBy,
  getATeacherDetails,
  deleteTeacher,
  importTeachers,
} = require("../../db/teachers/teachers")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const { hashPassword } = require("../../helper/password")
const { addTeacherWithUser } = require("../../db/users/user")
const fs = require("fs")
const os = require("os")
const multer = require("multer")
const { parse, CsvError } = require("csv-parse/sync")

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
// Import teacher details as csv file
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

    const students = await importTeachers(records)

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
