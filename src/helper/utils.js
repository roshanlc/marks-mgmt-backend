// Replace the '"' from the string
function escapeColon(msg) {
  return msg.replaceAll('"', "")
}

module.exports = { escapeColon }
