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

    // name of the role to be assigned
    const role = roleIdDetails.name.toLowerCase()

    const rolesCount = await db.userRoles.findMany({
      where: { userId: userId },
    })

    // student cannot be allowed other role
    const studentId = await db.student.findUnique({ where: { userId: userId } })
    if (studentId !== null && role !== "student") {
      return toResult(
        null,
        badRequestError("Student cannot be given any other roles.")
      )
    }

    // if student is present in student table but has not been assigned student role
    if (role === "student" && studentId !== null) {
      if (rolesCount.length > 0) {
        return toResult(
          null,
          errorResponse(
            "Conflict",
            "Student has already been assigned student role."
          )
        )
      }
    } else if (role === "student" && studentId === null) {
      // also prevent others from being student
      return toResult(
        null,
        badRequestError("Student role cannot be assigned to other users.")
      )
    }

    const roleAssigned = await db.userRoles.create({
      data: { userId: userId, roleId: roleIdDetails.id },
      include: {
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Add account to corresponding table with minimum details
    if (role === "teacher") {
      // skip if already exists
      const teacher = await db.teacher.findUnique({ where: { userId: userId } })
      if (teacher === null) {
        // Insert into teacher table
        await db.teacher.create({ data: { userId: userId } })
      }
    } else if (role === "admin") {
      const admin = await db.admin.findUnique({ where: { userId: userId } })
      if (admin === null) {
        // Insert into admin table
        await db.admin.create({ data: { userId: userId } })
      }
    } else if (role === "examhead") {
      const examHead = await db.examHead.findFirst({
        where: { userId: userId },
      })
      if (examHead === null) {
        // Insert into ExamHead table
        await db.examHead.create({ data: { userId: userId } })
      }
      // } else if (role === "programhead") {
      //   const programHead = await db.programHead.findFirst({
      //     where: { userId: userId },
      //   })
      // if (programHead === null) {
      //   // Insert into ProgramHead table
      //   await db.programHead.create({
      //     data: { user: { connect: { id: userId } } },
      //   })
      // }
    }

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
    } else if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return toResult(
        null,
        errorResponse(
          "Not Found",
          `Please provide valid details. Failed on foreign constraint fields.`
        )
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
    // allow only if a user has multiple roles

    const rolesCount = await db.userRoles.findMany({
      where: { userId: userId },
    })

    if (rolesCount.length === 0) {
      return toResult(
        null,
        NotFoundError("No UserRoles found for the provided details.")
      )
    } else if (rolesCount.length === 1) {
      return toResult(
        null,
        badRequestError("User has only a single role. Not Allowed.")
      )
    }

    const roleDeletion = await db.userRoles.delete({
      where: { userId_roleId: { roleId: roleId, userId: userId } },
      include: {
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    const roleName = roleDeletion.role.name.toLowerCase()
    // delete account from corresponding table
    if (roleName === "teacher") {
      // Delete from teacher table

      await db.teacher.delete({ where: { userId: userId } })
    } else if (roleName === "admin") {
      // Delete from admin table

      await db.admin.delete({ where: { userId: userId } })
    } else if (roleName === "examhead") {
      // delete from ExamHead table

      await db.examHead.delete({ where: { userId: userId } })
    }
    // else if (roleName === "programhead") {
    //   // delete from ProgramHead table

    //   const programHeadId = await db.programHead.findFirstOrThrow({
    //     where: { userId: userId },
    //   })
    //   await db.programHead.delete({ where: { id: programHeadId.id } })
    // }

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
