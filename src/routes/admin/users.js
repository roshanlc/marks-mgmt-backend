/**
 * This module contains controllers for fetching user related details by an admin
 */
const { Router } = require("express")
const { badRequestError, responseStatusCode } = require("../../helper/error")
const { getUserRoles } = require("../../db/users/roles")
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

module.exports = router
