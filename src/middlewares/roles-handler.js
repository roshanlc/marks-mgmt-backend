const { forbiddenError } = require("../helper/error")
const { extractTokenDetails } = require("../helper/extract-token")

function adminRoleHandler(req, res, next) {
  // Check if user has the role of a admin
  const tokenDetails = extractTokenDetails(req)
  const roles = tokenDetails.UserRoles

  let hasRole = false
  for (const roleObj of roles) {
    if (roleObj.role.name === "admin") {
      hasRole = true
      break
    }
  }

  // Incase the user is not an admin, return forbidden error
  if (!hasRole) {
    res.status(403).json(forbiddenError())
    return
  }
  // Pass the request to next handler
  next()
}

// check wether the token contains student role
function studentRoleHandler(req, res, next) {
  // Check if user has the role of a student
  const tokenDetails = extractTokenDetails(req)
  const roles = tokenDetails.UserRoles

  let hasRole = false
  for (const roleObj of roles) {
    if (roleObj.role.name === "student") {
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

// check whether the token contains teacher role
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

  // Incase the user is not a teacher, return forbidden error
  if (!hasRole) {
    res.status(403).json(forbiddenError())
    return
  }
  // Pass the request to next handler
  next()
}
// Check if user has the role of a admin or examHead
function adminorExamHeadRoleHandler(req, res, next) {
  const tokenDetails = extractTokenDetails(req)
  const roles = tokenDetails.UserRoles

  let hasRole = false
  for (const roleObj of roles) {
    if (roleObj.role.name === "admin" || roleObj.role.name === "examHead") {
      hasRole = true
      break
    }
  }

  // Incase the user is not an admin, return forbidden error
  if (!hasRole) {
    res.status(403).json(forbiddenError())
    return
  }
  // Pass the request to next handler
  next()
}

module.exports = {
  teacherRoleHandler,
  studentRoleHandler,
  adminRoleHandler,
  adminorExamHeadRoleHandler,
}
