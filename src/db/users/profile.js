// Db actions related to profile
const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const { errorResponse, internalServerError } = require("../../helper/error")
const { toResult } = require("../../helper/result")
const { getUserDetails } = require("./user")
const { getAStudentDetails } = require("../students/students")
const { hashPassword } = require("../../helper/password")

/**
 * Returns profile details
 * @param {Number} userId
 */
async function getProfileDetails(userId) {
  try {
    const profile = await db.user.findFirstOrThrow({
      where: { id: userId },
      include: {
        UserRoles: { include: { role: true } },
        Admin: true,
        ExamHead: true,
        Student: {
          include: {
            program: {
              include: { department: { include: { faculty: true } } },
            },
            StudentStatus: true,
            syllabus: true,
            semester: true,
          },
        },
        // ProgramHead: true,
        Teacher: true,
      },
    })

    // delete password property
    if (profile.password) {
      delete profile.password
    }

    return toResult(profile, null)
  } catch (err) {
    // check for "NotFoundError" explicitly
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.name === "NotFoundError"
    ) {
      return toResult(
        null,
        errorResponse("Not Found", "Please provide valid user id.")
      )
    } else {
      logger.warn(`getUserDetails(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * It provides complete details about a teacher
 * Courses taught and other details for current semester
 * @param {Number} userId
 */
async function getTeacherDetails(userId = 0, teacherId = 0) {
  // TODO: add more details about teacher such as courses taught
  return await db.teacher.findFirstOrThrow({
    where: { OR: [{ userId: userId }, { id: teacherId }] },
  })
}

/**
 * Update profile of a user
 * @param {*} userId
 * @param {*} email
 * @param {*} name
 * @param {*} address
 * @param {*} contactNo
 * @returns - updated profile or corresponding error
 */
async function updateProfile(
  userId,
  email = "",
  name = "",
  address = "",
  contactNo = "",
  password = ""
) {
  try {
    // password hash
    let passwordHash = ""
    if (password !== "") {
      passwordHash = hashPassword(password)
    }
    const profile = await db.user.update({
      where: { id: userId },
      data: {
        email: email === "" ? undefined : email,
        name: name === "" ? undefined : name,
        address: address === "" ? undefined : address,
        contactNo: contactNo === "" ? undefined : contactNo,
        password: passwordHash === "" ? undefined : passwordHash,
      },
      include: {
        UserRoles: { include: { role: true } },
        Admin: true,
        ExamHead: true,
        Student: {
          include: {
            program: {
              include: { department: { include: { faculty: true } } },
            },
            StudentStatus: true,
            syllabus: true,
            semester: true,
          },
        },
        // ProgramHead: true,
        Teacher: true,
      },
    })

    // delete password property
    if (profile.password) {
      delete profile.password
    }
    return toResult(profile, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(
        null,
        errorResponse(
          "Not Found",
          err?.meta?.cause || "Please provide valid details."
        )
      )
    } else if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return toResult(
        null,
        errorResponse(
          "Not Found",
          `Please provide valid details. Failed on foreign constraint fields.`
        )
      )
    } else if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. The email is already taken.`
        )
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        errorResponse("Bad Request", "Something wrong with the request.")
      )
    } else {
      logger.warn(`updateProfile(): ${err}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

module.exports = { getProfileDetails, getTeacherDetails, updateProfile }
