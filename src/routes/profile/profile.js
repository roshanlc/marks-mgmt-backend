/**
 * This module contains controllers for profile related endpoints
 */
const { getProfileDetails, updateProfile } = require("../../db/users/profile")
const { Router } = require("express")
const router = Router()
const { extractTokenDetails } = require("../../helper/extract-token")
const { responseStatusCode, badRequestError } = require("../../helper/error")
const Joi = require("joi")
const { escapeColon } = require("../../helper/utils")

// get personal profile
router.get("", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)
  const profile = await getProfileDetails(tokenDetails.id)

  // check for errors
  if (profile.err !== null) {
    res
      .status(responseStatusCode.get(profile.err.error.title) || 500)
      .json(profile.err)
    return
  }

  // return user profile details
  res.status(200).json(profile.result)
  return
})

const updateProfileSchema = Joi.object({
  name: Joi.string().allow("", null).optional().default(""),
  address: Joi.string().allow("", null).optional().default(""),
  email: Joi.string().allow("", null).optional().default(""),
  contactNo: Joi.string().allow("", null).optional().default(""),
})
// update personal profile
router.put("", async function (req, res) {
  const tokenDetails = extractTokenDetails(req)

  const err = updateProfileSchema.validate(req.body).error

  if (err !== undefined && err !== null) {
    res.status(400).json(badRequestError(escapeColon(err.message)))
    return
  }

  const { email, name, address, contactNo } = req.body

  const profile = await updateProfile(
    tokenDetails.id,
    email,
    name,
    address,
    contactNo
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

module.exports = router
