const { Router } = require("express")
const router = Router()
const {
  responseStatusCode,
  errorResponse,
  badRequestError,
  internalServerError,
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
  assignCourseToTeacher,
  removeCourseFromTeacher,
  addMultipleCourseToSyllabus,
  deleteMarkWeightage,
  addMultipleCourses,
} = require("../../../db/programs/courses")

const fs = require("fs")
const os = require("os")
const multer = require("multer")
const { parse, CsvError } = require("csv-parse/sync")

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

// delete a markweightage
router.delete("/markweightage/:id", async function (req, res) {
  const markWtId = Number(req.params.id) || 0
  if (markWtId <= 0) {
    res.status(400).json(badRequestError("Provide a valid mark weightage id."))
    return
  }

  const markWt = await deleteMarkWeightage(markWtId)

  if (markWt.err !== null) {
    res.status(responseStatusCode.get(markWt.err.error.title)).json(markWt.err)
    return
  }

  res.status(200).json(markWt.result)
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

  if (courseId <= 0) {
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

  if (courseId <= 0) {
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

  if (courseId <= 0) {
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

  if (courseId <= 0) {
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

const teacherAssign = Joi.object({
  programId: Joi.number().required().positive(),
  teacherId: Joi.number().required().positive(),
})

// Assign a course to a teacher
router.post("/:id/teacher", async function (req, res) {
  const courseId = Number(req.params.id) || 0

  if (courseId <= 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  // validate schema
  const err = teacherAssign.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // assign course to a program syllabus
  const { programId, teacherId } = req.body
  const assign = await assignCourseToTeacher(teacherId, courseId, programId)
  // check for error
  if (assign.err !== null) {
    res.status(responseStatusCode.get(assign.err.error.title)).json(assign.err)
    return
  }

  res.status(201).json(assign.result)
  return
})

// Remove a course from a teacher
router.delete("/:id/teacher", async function (req, res) {
  const courseId = Number(req.params.id) || 0

  if (courseId <= 0) {
    res.status(400).json(badRequestError("Provide a valid course id."))
    return
  }

  // validate schema
  const err = teacherAssign.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  // assign course to a program syllabus
  const { programId, teacherId } = req.body
  const assign = await removeCourseFromTeacher(teacherId, courseId, programId)
  // check for error
  if (assign.err !== null) {
    res.status(responseStatusCode.get(assign.err.error.title)).json(assign.err)
    return
  }

  res.status(200).json(assign.result)
  return
})

// schema for multiple courses addition to a programsyllabus
const multipleCoursesSchema = Joi.object({
  programId: Joi.number().required().positive(),
  syllabusId: Joi.number().required().positive(),
  semesterId: Joi.number().required().positive(),
  courses: Joi.array().items(Joi.number().positive()).required(),
})

// endpoint to assign multiple courses at once for a semester for a program syllabus
router.post("/assign", async function (req, res) {
  const err = multipleCoursesSchema.validate(req.body).error
  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { semesterId, programId, syllabusId, courses: coursesArr } = req.body

  // try to add courses to syllabus
  const courses = await addMultipleCourseToSyllabus(
    coursesArr,
    programId,
    syllabusId,
    semesterId
  )

  if (courses.err !== null) {
    res
      .status(responseStatusCode.get(courses.err.error.title))
      .json(courses.err)
    return
  }

  res.status(201).send(courses.result)
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

// Single file upload endpoint
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json(badRequestError("No file field found."))
      return
    }

    const file = req.file

    // check for mimetype
    if (file.mimetype !== "text/csv") {
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
    })

    const courses = await addMultipleCourses(records)

    // check for error
    if (courses.err !== null) {
      res
        .status(responseStatusCode.get(courses.err.error.title))
        .json(courses.err)
    } else {
      res.status(201).send(courses.result)
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
