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
const router = Router()

// fetch roles of a user
router.get("/:id/roles", async function (req, res) {
  const userId = Number(req.params.id) || 0

  if (userId === 0) {
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

  if (userId === 0) {
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

  if (userId === 0) {
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

module.exports = router
