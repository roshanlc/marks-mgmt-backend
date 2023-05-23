const { PrismaClient } = require("@prisma/client")
const { hashPassword } = require("../password")
const { permissions, roles } = require("./permsandroles")
// prisma client
const db = new PrismaClient()

async function seedRoleWithPerms() {
  db.rolePermissions
    .create({
      data: {
        permission: { name: "readPersonalMarks" },
        role: { name: "student" },
      },
    })
    .catch((e) => console.log(e))
    .then((x) => console.log(x))
}
// seed the permissions and roles table
async function seedPermsAndRoles() {
  try {
    const permCount = await db.permission.count()

    // only seed the table if empty
    if (permCount === 0) {
      const roleList = roles.map((role) => {
        return { name: role.name }
      })
      // Perform a db transaction
      db.$transaction([
        db.permission.createMany({ data: permissions }),
        db.role.createMany({ data: roleList }),
      ])
    }
  } catch (err) {
    console.log("Something went wrong, ", err.message)
  }
}

// seedDb seeds the database basic user details
async function seedDb() {
  const hash = hashPassword("Thisistheway")
  await db.users
    .createMany({
      data: [
        {
          email: "teacher1@pu.edu.np",
          password: hash,
          activated: true,
          expired: false,
          role: "TEACHER",
        },
        {
          email: "student1@pu.edu.np",
          password: hash,
          activated: true,
          expired: false,
          role: "STUDENT",
        },
        {
          email: "admin1@pu.edu.np",
          password: hash,
          activated: true,
          expired: false,
          role: "ADMIN",
        },
      ],
    })
    .then((resp) => console.log(resp))

  await db.users.findMany().then((resp) => console.log(resp))
}

// seedDb() // Call the function to seed the database for test purposes
// seedPermsAndRoles()

seedRoleWithPerms()
module.exports = seedDb
