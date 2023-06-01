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
  programSyllabus,
} = require("./programs")
const { courses, markWeightage } = require("./courses")
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
    // create N semester
    for (let i = 1; i <= semesters.length; i++) {
      await db.semester.create({ data: {} })
    }

    // create faculties
    for (const faculty of faculties) {
      await db.faculty.create({
        data: { name: faculty.name, head: faculty.head },
      })
    }

    // create levels
    await db.level.createMany({ data: level })

    for (const dept of departments) {
      await db.department.create({
        data: {
          name: dept.name,
          head: dept.head,
          faculty: { connect: { name: dept.faculty } },
        },
      })
    }
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
 * Seeds the db with programs data
 */
async function seedPrograms() {
  try {
    // create programs
    for (const program of programs) {
      await db.program.create({
        data: {
          name: program.name,
          level: { connect: { name: program.level } },
          department: {
            connect: { name: program.department },
          },
        },
      })
    }

    // insert max semesters a program can have
    for (const programSem of programSemesters) {
      await db.programSemesters.create({
        data: {
          program: { connect: { name: programSem.program } },
          totalSemesters: { connect: { id: programSem.semester } },
        },
      })
    }

    // add syllalbus for programs
    for (const syllabus of programSyllabus) {
      await db.syllabus.create({
        data: {
          name: syllabus.name,
          program: { connect: { name: syllabus.program } },
        },
      })
    }
  } catch (err) {
    logger.warn(`Something went wrong: ${err.message}`)
  }
}

/**
 * Seed courses and markweightage
 */
async function seedCourses() {
  try {
    for (const markWt of markWeightage) {
      await db.markWeightage.create({
        data: { practical: markWt.practical, theory: markWt.theory },
      })
    }
    const markWeightList = new WeakMap()

    for (const course of courses) {
      const markWtId =
        markWeightList.get(course.markWeightage) ||
        (await db.markWeightage.findFirstOrThrow({
          where: {
            AND: [
              {
                theory: course.markWeightage.theory,
                practical: course.markWeightage.practical,
              },
            ],
          },
        }))

      // set the data to map, so reduce fetching from db
      markWeightList.set(course.markWeightage, markWtId)

      // add courses
      await db.course.create({
        data: {
          credit: course.credit,
          name: course.name,
          code: course.code,
          elective: course.elective,
          project: course.project,
          markWeightageId: markWtId.id,
        },
      })
    }
  } catch (err) {
    logger.warn(`Something went wrong: ${err.message}`)
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

    await seedPrograms()

    await seedCourses()
    // then seed users table
    await seedUsers()

    // TODO: Add courses to certain programs (to all syllalbus, for each semester)
    // TODO: Add student, teacher and admin from seedUser()
    // TODO: Assign courses to teachers, add marks for a student
  } catch (err) {
    logger.warn(`Something went wrong: ${err.message}`)
  }
}

// verify configuration
verifyConfiguration()
// execute the seeding function
seedDatabase()
