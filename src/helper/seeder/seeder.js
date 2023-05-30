const { PrismaClient } = require("@prisma/client")
const { hashPassword } = require("../password")
const { roles } = require("./roles")
const logger = require("../logger")
const verifyConfiguration = require("../startup")
const {
  semesters,
  faculties,
  departments,
  programs,
  level,
  programSemesters,
} = require("./programs")
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

// seeds the db with programs info
async function seedDepartments() {
  try {
    // create 8 semester
    for (let i = 0; i < 8; i++) {
      await db.semester.create({ data: {} })
    }

    faculties.forEach(async (faculty) => {
      await db.faculty.create({
        data: { name: faculty.name, head: faculty.head },
      })
    })

    await db.level.createMany({ data: level })

    departments.forEach(async (dept) => {
      await db.department.create({
        data: {
          name: dept.name,
          head: dept.head,
          faculty: { connect: { name: dept.faculty } },
        },
      })
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
      name: "Teacher Sharma",
      address: "Kathmandu",
      contactNo: "",
      activated: true,
      expired: false,
      roles: ["teacher"],
    },
    {
      email: "student1@pu.edu.np",
      password: hash,
      name: "Student Sharma",
      address: "Kathmandu",
      contactNo: "",
      activated: true,
      expired: false,
      roles: ["student"],
      // student: {
      //   symbolNo: "19070130",
      //   PuRegNo: "2018-01-69-6599",
      //   program: "Computer Engineering",
      //   level: "Bachelor",
      //   semester: 8,
      // },
    },
    {
      email: "admin1@pu.edu.np",
      password: hash,
      name: "Admin Sharma",
      address: "Kathmandu",
      contactNo: "",
      activated: true,
      expired: false,
      roles: ["admin", "teacher"],
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

    userData.forEach(async (user) => {
      user.roles.forEach(async (role) => {
        db.userRoles
          .create({
            data: {
              user: { connect: { email: user.email } },
              role: { connect: { name: role } },
            },
          })
          .catch((err) => logger.warn(`Something went wrong: ${err}`))

        //   if (role === "student") {
        //     await db.student.create({
        //       data: {
        //         PuRegNo: user.student.PuRegNo,
        //         symbolNo: user.student.symbolNo,
        //         semester: user.student.semester,
        //         program: {
        //           connect: {
        //             name: user.student.program,
        //             level: user.student.level,
        //           },
        //         },
        //       },
        //     })
        //   }

        //   if (role === "teacher") {
        //     await db.teacher.create({
        //       data: { user: { connect: { email: user.email } } },
        //     })
        //   }

        //   if (role === "admin") {
        //     await db.admin.create({
        //       data: { user: { connect: { email: user.email } } },
        //     })
        //   }
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

    await seedDepartments()

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
