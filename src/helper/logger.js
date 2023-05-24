const pino = require("pino")

// logger for the app
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      ignore: "pid,hostname",
      colorize: true,
      translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
    },
  },
})

module.exports = logger
