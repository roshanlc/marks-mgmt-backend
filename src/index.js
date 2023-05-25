const dotenv = require("dotenv")
const express = require("express")
const app = express()
const loginRouter = require("./routes/login")
const authDemoRouter = require("./routes/auth-test")
const parsingErrorHandler = require("./middlewares/parsing")
const authHandler = require("./middlewares/auth")
const swaggerUi = require("swagger-ui-express")
const swaggerFile = require("./swagger/swagger-output.json")
const verifyConfiguration = require("./helper/startup")
const logger = require("./helper/logger")

dotenv.config() // load .env config

// check for configuration at start
verifyConfiguration()

// enable json parsing middleware
app.use(express.json())

// use the json parsing error handling middleware
app.use(parsingErrorHandler)

app.use("/api/v1", loginRouter)

// A basic endpoint to verify token validity
// TODO: remove after project completion
app.use("/api/v1", authHandler, authDemoRouter)

// Swagger documentation
// Keep it at the end
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.listen(9000, () => {
  console.log("-".repeat(75))
  logger.info("⚡Started at 9000 : ", new Date().toLocaleString())
  console.log(
    "Did you seed the database?\nRun 'pnpm run seed' to seed the database."
  )
})
