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
const {
  markWeightage,
  old_comp_courses,
  soft_old_courses,
} = require("./courses")
const { admins, students, teachers } = require("./users.js")
const {
  addStudentWithUser,
  addTeacherWithUser,
  addAdminWithUser,
} = require("../../db/users/user")
const {
  getProgramById,
  getSyllabusById,
  addBatch,
} = require("../../db/programs/others")
const { assignRoleToUser } = require("../../db/users/roles")

// prisma client
const db = new PrismaClient()

// seed the permissions and roles table
async function seedRoles() {
  try {
    await db.role.createMany({
      data: roles,
    })
  } catch (err) {
    logger.warn(`seedRoles(): Something went wrong: ${err.message}`)
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
    logger.warn(`seedDepartments(): Something went wrong: ${err.message}`)
  }
}

// seedDb seeds the database basic user details
async function seedUsers() {
  const hash = hashPassword("Thisistheway")
  for (const student of students) {
    try {
      const programId = await getProgramById(0, student.program)
      if (programId.err !== null) {
        throw programId.err
      }

      const syllabusId = await getSyllabusById(0, student.syllabus)

      await addStudentWithUser(
        student.email,
        hash,
        student.name,
        student.address,
        student.contactNo,
        student.activated,
        student.expired,
        student.symbolNo,
        student.puRegNo,
        student.semester,
        programId.result.id,
        syllabusId.result.id,
        student.yearJoined,
        student.dateOfBirth,
        student.status
      )
    } catch (err) {
      logger.warn(`Something went wrong: ${err}`)
      console.log(err)
    }
  }

  for (const teacher of teachers) {
    try {
      const teacherDetails = await addTeacherWithUser(
        teacher.email,
        hash,
        teacher.name,
        teacher.address,
        teacher.contactNo,
        teacher.activated,
        teacher.expired
      )
      if (teacherDetails.err !== null) {
        throw teacherDetails.err
      }
      // Assign more roles if other teacher is provided
      if (teacher.roles.length > 1) {
        for (const role of teachers.roles) {
          if (role === "teacher") continue
          await assignRoleToUser(teacherDetails.result.id, role)
        }
      }
    } catch (err) {
      logger.warn(`Something went wrong: ${err}`)
      console.log(err)
    }
  }

  for (const admin of admins) {
    try {
      const adminDetails = await addAdminWithUser(
        admin.email,
        hash,
        admin.name,
        admin.address,
        admin.contactNo,
        admin.activated,
        admin.expired
      )
      if (adminDetails.err !== null) {
        throw adminDetails.err
      }
      // Assign more roles if other teacher is provided
      if (admin.roles.length > 1) {
        for (const role of admin.roles) {
          if (role === "admin") continue
          await assignRoleToUser(adminDetails.result.id, role)
        }
      }
    } catch (err) {
      logger.warn(`seedUsers(): Something went wrong: ${err}`)
      console.log(err)
    }
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
    logger.warn(`seedPrograms(): Something went wrong: ${err.message}`)
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

    const compProgramId = await db.program.findFirst({
      where: { name: "Computer Engineering", level: { name: "Bachelor" } },
    })

    const oldSyllabusId = await db.syllabus.findFirst({
      where: { name: "Computer Old Syllabus" },
    })

    const markWeightList = new WeakMap()

    // seed old syllabus of computer engg
    for (const semester of old_comp_courses) {
      for (const course of semester.courses) {
        try {
          const markWeightage = { theory: 30, practical: 20 }

          const markWtId =
            markWeightList.get(markWeightage) ||
            (await db.markWeightage.findFirstOrThrow({
              where: {
                AND: [
                  {
                    theory: markWeightage.theory,
                    practical: markWeightage.practical,
                  },
                ],
              },
            }))

          // set the data to map, so reduce fetching from db
          markWeightList.set(markWeightage, markWtId)

          // add courses
          const courseDetails = await db.course.create({
            data: {
              credit: course.credits,
              name: course.course_title,
              code: course.code || undefined,
              elective: course.elective || false,
              project: course.project || false,
              markWeightage: { connect: { id: markWtId.id } },
            },
          })

          await db.programCourses.create({
            data: {
              courseId: courseDetails.id,
              programId: compProgramId.id,
              semesterId: semester.semester,
              syllabusId: oldSyllabusId.id,
            },
          })
        } catch (err) {
          console.log(err)
          logger.warn(`Something went wrong: ${err.message}`)
        }
      }
    }

    const softProgramId = await db.program.findFirst({
      where: { name: "Software Engineering", level: { name: "Bachelor" } },
    })

    const oldSoftSyllabusId = await db.syllabus.findFirst({
      where: { name: "Software Old Syllabus" },
    })

    // seed old syllabus of soft engg

    for (const semester of soft_old_courses) {
      for (const course of semester.courses) {
        try {
          const markWeightage = { theory: 30, practical: 20 }

          const markWtId =
            markWeightList.get(markWeightage) ||
            (await db.markWeightage.findFirstOrThrow({
              where: {
                AND: [
                  {
                    theory: markWeightage.theory,
                    practical: markWeightage.practical,
                  },
                ],
              },
            }))

          // set the data to map, so reduce fetching from db
          markWeightList.set(markWeightage, markWtId)

          // add courses
          const courseDetails = await db.course.upsert({
            where: { code: course.code },
            update: {
              credit: course.credits,
              name: course.course_title,
              code: course.code || undefined,
              elective: course.elective || false,
              project: course.project || false,
              markWeightage: { connect: { id: markWtId.id } },
            },
            create: {
              credit: course.credits,
              name: course.course_title,
              code: course.code || undefined,
              elective: course.elective || false,
              project: course.project || false,
              markWeightage: { connect: { id: markWtId.id } },
            },
          })

          await db.programCourses.create({
            data: {
              courseId: courseDetails.id,
              programId: softProgramId.id,
              semesterId: semester.semester,
              syllabusId: oldSoftSyllabusId.id,
            },
          })
        } catch (err) {
          console.log(err)
          logger.warn(`Something went wrong: ${err.message}`)
        }
      }
    }
  } catch (err) {
    logger.warn(`seedCourses(): Something went wrong: ${err.message}`)
  }
}

// Create batch
async function createBatch() {
  try {
    const year = new Date().getFullYear()
    await addBatch(year, "FALL", true, true)
  } catch (err) {
    logger.warn(`createBatch(): Something went wrong, ${err.message}`)
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

    await createBatch()

    await seedDepartments()

    await seedPrograms()

    await seedCourses()

    // then seed users table
    await seedUsers()

    // TODO: Add courses to certain programs (to all syllalbus, for each semester)
    // TODO: Add student, teacher and admin from seedUser()
    // TODO: Assign courses to teachers, add marks for a student
  } catch (err) {
    logger.warn(`seedDatabase(): Something went wrong: ${err.message}`)
  }
}

// verify configuration
verifyConfiguration()
// execute the seeding function
seedDatabase()
