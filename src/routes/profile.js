const { getProfileDetails } = require("../db/profile")
/**
 * This module contains controllers for profile related endpoints
 */
const { Router } = require("express")
const router = Router()
const { extractTokenDetails } = require("../helper/extract-token")
const { responseStatusCode } = require("../helper/error")

router.get("/profile", async function (req, res) {
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

module.exports = router
