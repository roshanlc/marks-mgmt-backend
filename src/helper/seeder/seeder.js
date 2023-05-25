const { PrismaClient } = require("@prisma/client")
const { hashPassword } = require("../password")
const { roles } = require("./roles")
const logger = require("../logger")
const verifyConfiguration = require("../startup")
// prisma client
const db = new PrismaClient()

// seed the permissions and roles table
async function seedRoles() {
  try {
    await db.role.createMany({
      data: roles,
    })
  } catch (err) {
    logger.warn(`Something went wrong: ${err.message}`)
  }
}

// seedDb seeds the database basic user details
async function seedUsers() {
  const hash = hashPassword("Thisistheway")

  const userData = [
    {
      email: "teacher1@pu.edu.np",
      password: hash,
      name: "Balen Shah",
      address: "Kathmandu",
      contactNo: "",
      activated: true,
      expired: false,
      roles: ["teacher"],
    },
    {
      email: "student1@pu.edu.np",
      password: hash,
      name: "Ram Sharma",
      address: "Kathmandu",
      contactNo: "",
      activated: true,
      expired: false,
      roles: ["student"],
    },
    {
      email: "admin1@pu.edu.np",
      password: hash,
      name: "Kapil Sharma",
      address: "Kathmandu",
      contactNo: "",
      activated: true,
      expired: false,
      roles: ["admin"],
    },
  ]

  try {
    await db.user.createMany({
      data: userData.map((user) => {
        return {
          email: user.email,
          password: user.password,
          name: user.name,
          address: user.address,
          contactNo: user.contactNo,
          activated: user.activated,
          expired: user.expired,
        }
      }),
    })

    userData.forEach((user) => {
      user.roles.forEach((role) => {
        db.userRoles
          .create({
            data: {
              user: { connect: { email: user.email } },
              role: { connect: { name: role } },
            },
          })
          .catch((err) => logger.warn(`Something went wrong: ${err}`))
      })
    })
  } catch (err) {
    logger.warn(`Something went wrong: ${err}`)
  }
}

/**
 * seeds the database with data
 */
async function seedDatabase() {
  try {
    logger.info("The database seeding has started.")
    // seed the roles table at first
    await seedRoles()
    // then seed users table
    await seedUsers()
  } catch (err) {
    logger.warn(`Something went wrong: ${err.message}`)
  }
}

// verify configuration
verifyConfiguration()
// execute the seeding function
seedDatabase()
