const express = require("express")
const app = express()
const cors = require("cors")
const helmet = require("helmet")

// Add cors support
app.use(
  cors({
    preflightContinue: true,
    origin: "*",
  })
)

// Helmet prevents from sending response headers with explicit info
app.use(helmet())

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "You are here at the altar of the great Jedis!!!" })
  return
})
app.listen(9000, () => {
  console.log("-".repeat(75))
  console.log("⚡Started at 9000 : ", new Date().toLocaleString())
})
