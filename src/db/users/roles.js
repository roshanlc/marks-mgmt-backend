/**
 * This module contains method related to fetching roles of a user
 */
const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const {
  errorResponse,
  internalServerError,
  badRequestError,
  NotFoundError,
} = require("../../helper/error")
const { toResult } = require("../../helper/result")

/**
 * Fetches roles for the given user id
 * @param {Number} userId - user id to fetch roles of
 * @returns the roles given to the user id
 */
async function getUserRoles(userId) {
  try {
    const userRoles = await db.userRoles.findMany({
      where: { userId: userId },
      include: {
        role: { select: { id: true, name: true, description: true } },
      },
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

    return toResult({ roles: userRoles }, null)
  } catch (err) {
    logger.warn(`getUserRoles(): ${err.message}`) // Always log cases for internal server error
    return toResult(null, internalServerError())
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

/**
 * Asign a role to user from role name or role id
 * @param {*} userId
 * @param {*} roleName
 * @param {*} roleId
 * @returns
 */
async function assignRoleToUser(userId, roleName = "", roleId = 0) {
  try {
    // get role roleId
    const roleIdDetails = await db.role.findFirstOrThrow({
      where: {
        name: roleName === "" ? undefined : roleName,
        id: roleId > 0 ? roleId : undefined,
      },
    })

    const roleAssigned = await db.userRoles.create({
      data: { userId: userId, roleId: roleIdDetails.id },
    })

    return toResult({ role: roleAssigned }, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. Please update method to update the resource.`
        )
      )
    } else if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(
        null,
        NotFoundError(`Provided details does not exist. ${err.message}`)
      )
    } else {
      logger.warn(`assignRoleToUser(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * List all roles available in the system with user count
 * @returns return types of user roles in the system with user count
 */
async function listAllRoles() {
  try {
    const roles = await db.role.findMany({
      include: { _count: true },
    })
    return toResult({ roles: roles }, null)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something wrong with the data. ${err.message}`)
      )
    } else {
      logger.warn(`lisAllRoles(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Remove role from a user
 * @param {*} userId - id of the user
 * @param {*} roleId - id of the role to be removed
 * @returns - removed role or corresponding error
 */

async function removeRoleFromUser(userId, roleId) {
  try {
    const roleDeletion = await db.userRoles.delete({
      where: { userId_roleId: { roleId: roleId, userId: userId } },
    })
    return toResult({ role: roleDeletion }, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(
        null,
        NotFoundError(
          `Provided details does not exist. ${
            err?.meta?.cause || "User or role does not exist"
          }`
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something wrong went with request. ${err.message}`)
      )
    } else {
      logger.warn(`removeRoleFromUser(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

module.exports = {
  getUserRoles,
  hasRole,
  assignRoleToUser,
  listAllRoles,
  removeRoleFromUser,
}
