/**
 * This module contains db functions related to miscellanous activities
 * such as adding batch, getting latest batch, etc
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../helper/logger")
const { errorResponse, internalServerError } = require("../helper/error")
const { toResult } = require("../helper/result")

/**
 * Add new batch in the db
 * Used to initiate new semester
 * @param {Number} year
 * @param {String} season
 */
async function addBatch(year, season) {
  try {
    // TODO: add a logic to prevent same year and season being added again
    const batchInfo = await db.batch.create({
      data: { year: year, season: season },
    })
    return toResult(batchInfo, null)
  } catch (err) {
    logger.warn(`addBatch(): ${err.message}`) // Always log cases for internal server error
    return toResult(null, internalServerError)
  }
}

/**
 *
 * @returns Latest batch info
 */
async function getLatestBatch() {
  try {
    const batchInfo = await db.batch.findFirstOrThrow({
      orderBy: { id: "desc" },
    })
    return toResult(batchInfo, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "No entry found in the batch table.")
      )
    } else {
      logger.warn(`getLatestBatch(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError)
    }
  }
}

module.exports = { addBatch, getLatestBatch }
