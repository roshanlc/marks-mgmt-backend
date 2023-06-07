const errorResponse = require("../helper/error")

// handles the parsing error of json
// and returns a 400 response
function parsingErrorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    // TODO: Add logger here
    return res.status(400).send(errorResponse("Bad Request", err.message))
  }
  next()
}

module.exports = parsingErrorHandler
