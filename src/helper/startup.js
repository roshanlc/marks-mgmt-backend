const { PrismaClient } = require("@prisma/client")
const logger = require("./logger")

/**
 * Checks for db connection at startup
 */
function checkDbConnection() {
  const db = new PrismaClient()
  // check for db connection
  // and exit the process if any error occurs
  db.$connect().catch((err) => {
    logger.warn(`Db connection error: ${err.message}`)
    logger.warn("Please fix errors and run the program again.")
    process.exit(1)
  })
}

/**
 * It verifies configuration file at startup
 */

function verifyConfiguration() {
  const configs = [
    "DATABASE_URL",
    "JWT_SECRET",
    "GMAIL_ID",
    "GMAIL_GENERATED_PW",
  ]

  for (let i = 0; i < configs.length; i++) {
    if (!(configs[i] in process.env)) {
      logger.warn(
        `${configs[i]} is not set in ".env" file. Please set it and run again.`
      )
      logger.warn(`The program will not exit.`)
      process.exit(1)
    }
  }

  // check for proper db connection
  checkDbConnection()
}

module.exports = verifyConfiguration
