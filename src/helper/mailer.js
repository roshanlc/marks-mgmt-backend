// try to send email
const nodemailer = require("nodemailer")
const logger = require("./logger")

// email password and user id
const username = process.env.GMAIL_ID
const genPassword = process.env.GMAIL_GENERATED_PW

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: username,
    pass: genPassword,
  },
})

// send Mail
async function sendMail(to, subject, text) {
  const mailOptions = {
    from: username,
    to: to,
    subject: subject,
    text: text,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.warn(error)
    } else {
      logger.info(info.response)
    }
  })
}

module.exports = { sendMail }
