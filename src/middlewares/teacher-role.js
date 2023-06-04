const { forbiddenError } = require("../helper/error")
const { extractTokenDetails } = require("../helper/extract-token")

function teacherRoleHandler(req, res, next) {
  // Check if user has the role of a teacher
  const tokenDetails = extractTokenDetails(req)
  const roles = tokenDetails.UserRoles

  let hasRole = false
  for (const roleObj of roles) {
    if (roleObj.role.name === "teacher") {
      hasRole = true
      break
    }
  }

  // Incase the user is not a student, return forbidden error
  if (!hasRole) {
    res.status(403).json(forbiddenError())
    return
  }
  // Pass the request to next handler
  next()
}

module.exports = teacherRoleHandler
