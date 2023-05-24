/**
 *
 * Wrap result and error into single objects
 * Used to return result and error from db functions
 *
 * @param {Object} details
 * @param {Error} err
 * @returns An object containing result and error
 */

function toResult(details, err) {
  return {
    result: details,
    err: err,
  }
}

module.exports = { toResult }
