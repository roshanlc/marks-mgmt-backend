/**
 * This module contains controllers for fetching user related details by an admin
 */
const { Router } = require("express")
const {
  badRequestError,
  responseStatusCode,
  errorResponse,
} = require("../../helper/error")
const {
  getUserRoles,
  listAllRoles,
  assignRoleToUser,
  removeRoleFromUser,
} = require("../../db/users/roles")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")
const {
  getUserDetails,
  listAllUsers,
  deleteUser,
  addAdminWithUser,
  addExamHeadWithUser,
} = require("../../db/users/user")
const { updateProfile, getProfileDetails } = require("../../db/users/profile")
const router = Router()

// fetch roles of a user
router.get("/:id/roles", async function (req, res) {
  const userId = Number(req.params.id) || 0

  if (userId <= 0) {
    res.status(400).json(badRequestError("Please provide a proper user id."))
    return
  }

  const userRoles = await getUserRoles(userId)

  if (userRoles.err !== null) {
    res
      .status(responseStatusCode.get(userRoles.err.error.title) || 400)
      .json(userRoles.err)
    return
  }

  res.status(200).json(userRoles.result)
  return
})

// fetch roles of the system
router.get("/roles", async function (req, res) {
  const roles = await listAllRoles()

  if (roles.err !== null) {
    res
      .status(responseStatusCode.get(roles.err.error.title) || 400)
      .json(roles.err)
    return
  }

  res.status(200).json(roles.result)
  return
})

const roleSchema = Joi.object({
  roleId: Joi.number().positive().required().min(1),
})

// assign a role to a user
router.put("/:id/roles", async function (req, res) {
  const userId = Number(req.params.id) || 0

  if (userId <= 0) {
    res.status(400).json(badRequestError("Please provide a proper user id."))
    return
  }

  const err = roleSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { roleId } = req.body

  const updateRole = await assignRoleToUser(userId, "", roleId)

  if (updateRole.err !== null) {
    res
      .status(responseStatusCode.get(updateRole.err.error.title) || 400)
      .json(updateRole.err)
    return
  }

  res.status(200).json(updateRole.result)
  return
})

// remove a role from a user
router.delete("/:id/roles", async function (req, res) {
  const userId = Number(req.params.id) || 0

  if (userId <= 0) {
    res.status(400).json(badRequestError("Please provide a proper user id."))
    return
  }

  const err = roleSchema.validate(req.body).error

  // incase of errors during schema validation
  if (err !== undefined && err !== null) {
    res.status(400).json(errorResponse("Bad Request", escapeColon(err.message)))
    return
  }

  const { roleId } = req.body

  const updateRole = await removeRoleFromUser(userId, roleId)

  if (updateRole.err !== null) {
    res
      .status(responseStatusCode.get(updateRole.err.error.title) || 400)
      .json(updateRole.err)
    return
  }

  res.status(200).json(updateRole.result)
  return
})

// fetch a user's details
router.get("/:id", async function (req, res) {
  const userId = Number(req.params.id) || 0

  if (userId <= 0) {
    res.status(400).json(badRequestError("Please provide a proper user id."))
    return
  }

  const user = await getUserDetails(userId)

  if (user.err !== null) {
    res
      .status(responseStatusCode.get(user.err.error.title) || 400)
      .json(user.err)
    return
  }

  res.status(200).json(user.result)
  return
})

// fetch all users' details
router.get("", async function (req, res) {
  const roleId = Number(req.query.role_id) || 0

  const users = await listAllUsers(roleId)

  if (users.err !== null) {
    res
      .status(responseStatusCode.get(users.err.error.title) || 400)
      .json(users.err)
    return
  }

  res.status(200).json(users.result)
  return
})

const updateProfileSchema = Joi.object({
  name: Joi.string().allow("", null).optional().default(""),
  address: Joi.string().allow("", null).optional().default(""),
  email: Joi.string().allow("", null).optional().default(""),
  contactNo: Joi.string().allow("", null).optional().default(""),
  password: Joi.string().allow("", null).optional().default(""),
})
// update a user's profile
router.put("/:id/profile", async function (req, res) {
  const userId = Number(req.params.id) || 0

  if (userId <= 0) {
    res.status(400).json(badRequestError("Please provide a proper user id."))
    return
  }

  const err = updateProfileSchema.validate(req.body).error

  if (err !== undefined && err !== null) {
    res.status(400).json(badRequestError(escapeColon(err.message)))
    return
  }

  const { email, name, address, contactNo, password } = req.body

  const profile = await updateProfile(
    userId,
    email,
    name,
    address,
    contactNo,
    password
  )

  // check for errors
  if (profile.err !== null) {
    res
      .status(responseStatusCode.get(profile.err.error.title) || 400)
      .json(profile.err)
    return
  }

  // return user profile details
  res.status(200).json(profile.result)
  return
})

// get a user's profile
router.get("/:id/profile", async function (req, res) {
  const userId = Number(req.params.id) || 0

  if (userId <= 0) {
    res.status(400).json(badRequestError("Please provide a proper user id."))
    return
  }

  const profile = await getProfileDetails(userId)
  // check for errors
  if (profile.err !== null) {
    res
      .status(responseStatusCode.get(profile.err.error.title) || 400)
      .json(profile.err)
    return
  }

  // return user profile details
  res.status(200).json(profile.result)
  return
})

// delete a user
router.delete("/:id", async function (req, res) {
  const userId = Number(req.params.id) || 0

  if (userId <= 0) {
    res.status(400).json(badRequestError("Please provide a proper user id."))
    return
  }

  const user = await deleteUser(userId)
  // check for errors
  if (user.err !== null) {
    res
      .status(responseStatusCode.get(user.err.error.title) || 400)
      .json(user.err)
    return
  }

  // return deleted user's  details
  res.status(200).json(user.result)
  return
})

const createAdminSchema = Joi.object({
  name: Joi.string().allow("", null).optional().default(""),
  address: Joi.string().allow("", null).optional().default(""),
  email: Joi.string().allow("", null).optional().default(""),
  contactNo: Joi.string().allow("", null).optional().default(""),
  password: Joi.string().required().trim().min(5).max(50),
  role: Joi.string().required(),
})
// create an admin's account
router.post("/", async function (req, res) {
  const err = createAdminSchema.validate(req.body).error

  if (err !== undefined && err !== null) {
    res.status(400).json(badRequestError(escapeColon(err.message)))
    return
  }

  const { email, name, address, contactNo, password, role } = req.body

  let profile = {}
  if (role.toLowerCase() === "admin") {
    profile = await addAdminWithUser(email, password, name, address, contactNo)
  } else if (role.toLowerCase() === "examhead") {
    profile = await addExamHeadWithUser(
      email,
      password,
      name,
      address,
      contactNo
    )
  } else {
    res.status(400).json(badRequestError("Provide a valid role value."))
    return
  }

  if (profile.err !== null) {
    // check for errors
    res
      .status(responseStatusCode.get(profile.err.error.title) || 400)
      .json(profile.err)
    return
  }

  // return user profile details
  res.status(201).json(profile.result)
  return
})

module.exports = router
