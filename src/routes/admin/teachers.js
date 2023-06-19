/**
 * This module contains controllers for fetching student details by an admin
 */
const { Router } = require("express")
const router = Router()
const { responseStatusCode } = require("../../helper/error")
const {
  getAllTeachersCount,
  listAllTeachers,
  listTeachersBy,
  getATeacherDetails,
} = require("../../db/teachers/teachers")

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
  const { id } = req.params
  const teacher = await getATeacherDetails(Number(id) || 0, Number(id) || 0)

  if (teacher.err !== null) {
    res
      .status(responseStatusCode.get(teacher.err.error.title) || 400)
      .json(teacher.err)
    return
  }

  res.status(200).json(teacher.result)
})

module.exports = router
