/**
 * Contains public endpoints
 */
const { Router } = require("express")
const router = Router()
const { responseStatusCode } = require("../../helper/error")
const {
  getFaculties,
  getFacultyById,
  getDepartments,
  getDepartmentById,
  getPrograms,
  getProgramById,
  getSyllabusById,
  getAllSyllabus,
} = require("../../db/others")

//get all faculties
router.get("/faculties", async function (req, res) {
  const faculties = await getFaculties()
  if (faculties.err !== null) {
    res
      .status(responseStatusCode(faculties.err.error.title) || 400)
      .json(faculties.err)
    return
  }

  res.status(200).json(faculties.result)
  return
})

//get an individual faculty
router.get("/faculties/:id", async function (req, res) {
  const { id } = req.params

  const faculties = await getFacultyById(Number(id) || 0)
  if (faculties.err !== null) {
    res
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
    res.status(responseStatusCode(depts.err.error.title) || 400).json(depts.err)
    return
  }

  res.status(200).json(depts.result)
  return
})

//get an individual department
router.get("/departments/:id", async function (req, res) {
  const { id } = req.params

  const dept = await getDepartmentById(Number(id) || 0)
  if (dept.err !== null) {
    res
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
      .status(responseStatusCode(programs.err.error.title) || 400)
      .json(programs.err)
    return
  }

  res.status(200).json(programs.result)
  return
})

//get an individual program
router.get("/programs/:id", async function (req, res) {
  const { id } = req.params

  const program = await getProgramById(Number(id) || 0)
  if (program.err !== null) {
    res
      .status(responseStatusCode.get(program.err.error.title) || 400)
      .json(program.err)
    return
  }

  res.status(200).json(program.result)
  return
})

//get all syllabus
router.get("/syllabus", async function (req, res) {
  const syallbus = await getAllSyllabus()
  if (syallbus.err !== null) {
    res
      .status(responseStatusCode(syallbus.err.error.title) || 400)
      .json(syallbus.err)
    return
  }

  res.status(200).json(syallbus.result)
  return
})

//get an individual syllabus
router.get("/syllabus/:id", async function (req, res) {
  const { id } = req.params

  const syallbus = await getSyllabusById(Number(id) || 0)
  if (syallbus.err !== null) {
    res
      .status(responseStatusCode.get(syallbus.err.error.title) || 400)
      .json(syallbus.err)
    return
  }

  res.status(200).json(syallbus.result)
  return
})

module.exports = router
