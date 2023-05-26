// Db actions related to profile
const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../helper/logger")
const { errorResponse, internalServerError } = require("../helper/error")
const { toResult } = require("../helper/result")
const { getUserDetails } = require("./user")

/**
 * Returns profile details
 * @param {Number} userId
 */
async function getProfileDetails(userId) {
  try {
    const profile = await getUserDetails(userId)

    // incase of error, return as it is
    if (profile.err !== null || profile.result.UserRoles.length === 0) {
      return profile
    }

    console.log(profile.result) // TODO: remove this later

    // loop over user roles array
    // extract details for "student" and "teacher" roles
    // TODO: extraction process in progress
    for (const roleObj of profile.result.UserRoles) {
      if (roleObj.role.name === "student") {
        const studentDetails = await db.student.findFirstOrThrow({
          where: { userId: profile.result.id },
        })

        console.log("stud:", studentDetails) // TODO: remove this later
      }
    }
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "Please provide valid user id.")
      )
    } else {
      logger.warn(`getUserDetails(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

const tryOut = async () => {
  console.log(await getProfileDetails(2))
}
tryOut()
