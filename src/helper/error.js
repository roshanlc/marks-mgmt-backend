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

module.exports = errorResponse
