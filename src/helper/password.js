const bcrypt = require("bcrypt")

// number of salt rounds
const saltRounds = 10

/**
 * Generate hash of a plain password
 * @param {String} plaintext - plain password text
 *
 * @returns {String} - hashed password
 *
 */
function hashPassword(plaintext) {
  return bcrypt.hashSync(plaintext, saltRounds)
}

/**
 * Compare plain password and hash
 * @param {String} plaintext - plain password text
 * @param {String} hash - hashed password
 *
 * @returns {Object}
 */
function compareHash(plaintext, hash) {
  return bcrypt.compareSync(plaintext, hash)
}

module.exports = { hashPassword, compareHash }
