const { PrismaClient } = require("@prisma/client")
const { hashPassword } = require("../password")
const { permissions, roles } = require("./permsandroles")
// prisma client
const db = new PrismaClient()

// seed Role with specific Permissions
async function seedRoleWithPerms() {
  try {
    roles.forEach((role) => {
      role.permissions.map((perm) => {
        db.rolePermissions
          .create({
            data: {
              role: { connect: { name: role.name } },
              permission: {
                connect: {
                  name: perm,
                },
              },
            },
          })
          .then((msg) => console.log(msg))
      })
    })
  } catch (err) {
    console.log("Something went wrong: ", err)
  }
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
      await db.$transaction([
        db.permission.createMany({ data: permissions }),
        db.role.createMany({ data: roleList }),
      ])

      await seedRoleWithPerms()
    }
  } catch (err) {
    console.log("Something went wrong, ", err.message)
  }
}

// seedDb seeds the database basic user details
async function seedDb() {
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
      role: "student",
    },
    {
      email: "student1@pu.edu.np",
      password: hash,
      name: "Ram Sharma",
      address: "Kathmandu",
      contactNo: "",
      activated: true,
      expired: false,
      role: "teacher",
    },
    {
      email: "admin1@pu.edu.np",
      password: hash,
      name: "Kapil Sharma",
      address: "Kathmandu",
      contactNo: "",
      activated: true,
      expired: false,
      role: "teacher",
    },
  ]

  try {
    const count = await db.user.count()

    if (count > 0) return // donot seed if there are users in the system already

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
      db.userRoles.create({
        data: {
          user: { connect: { email: user.email } },
          role: { connect: { name: user.role } },
        },
      })
    })
  } catch (err) {
    console.log("Something went wrong: ", err)
  }
}

seedPermsAndRoles()
seedDb() // Call the function to seed the database for test purposes

module.exports = seedDb
