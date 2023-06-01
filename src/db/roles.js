/**
 * This module contains method related to fetching roles of a user
 */
const { PrismaClient } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../helper/logger")
const { errorResponse, internalServerError } = require("../helper/error")
const { toResult } = require("../helper/result")

/**
 * Fetches roles for the given user id
 * @param {Number} userId - user id to fetch roles of
 * @returns the roles given to the user id
 */
async function getUserRoles(userId) {
  try {
    const userRoles = await db.userRoles.findMany({
      where: { userId: userId },
      select: { role: { select: { id: true, name: true } } },
    })

    if (
      userRoles === null ||
      userRoles === undefined ||
      userRoles.length === 0
    ) {
      return toResult(
        null,
        errorResponse(
          "Not Found",
          "No roles found for the user Id. Either invalid userId or missing role."
        )
      )
    }

    return toResult(userRoles, null)
  } catch (err) {
    logger.warn(`getUserRoles(): ${err.message}`) // Always log cases for internal server error
    return toResult(null, internalServerError)
  }
}

/**
 * Returns boolean whether the user has given role
 * @param {Number} userId - id of the user in user table
 * @param {string} role - role of the user to check for
 * @returns boolean
 */
async function hasRole(userId, role) {
  const roleQuery = await getUserRoles(userId)
  if (roleQuery.err !== null) {
    return roleQuery
  }

  // Loop over the roles array to check
  // if user has the said role
  for (const roleObj of roleQuery.result) {
    if (roleObj.role.name === role) {
      return toResult(true, null)
    }
  }
  return toResult(false, null)
}

module.exports = { getUserRoles, hasRole }
