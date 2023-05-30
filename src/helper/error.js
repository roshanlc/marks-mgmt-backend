/**
 * Returns an object describing an error
 * @param {String} title title of the error response
 * @param {*} message detailed information about the error response
 * @returns An object describing an error
 */
function errorResponse(title, message) {
  return {
    error: {
      title: title,
      message: message,
    },
  }
}

/**
 * Returns a error response due to authentication error
 * @returns Authentication Error
 */
function authenticationError() {
  return errorResponse(
    "Authentication Error",
    "Please provide valid login credentials."
  )
}

/**
 * Returns a error response due to internal server error
 * @returns Internal Server Error
 */
function internalServerError() {
  return errorResponse("Internal Server Error", "Something went wrong")
}

/**
 * Returns a error response due to lack of permissions
 * @returns Forbidden Error
 */
function forbiddenError() {
  return errorResponse(
    "Forbidden Error",
    "You donot have enough permission to access this endpoint."
  )
}

/**
 * Returns a error for 404 error
 * @returns Not Found Error
 */
function NotFoundError(msg = "") {
  return errorResponse(
    "Not Found",
    msg === "" ? "The request entity could not be found." : msg
  )
}

// map of error title and corresponding status code
const responseStatusCode = new Map()
  .set("Authentication Error", 401)
  .set("Unauthorized", 401)
  .set("Bad Request", 400)
  .set("Not Found", 404)
  .set("OK", 200)
  .set("Internal Server Error", 500)
  .set("Forbidden Error", 403)

module.exports = {
  errorResponse,
  authenticationError,
  responseStatusCode,
  forbiddenError,
  internalServerError,
  NotFoundError,
}
