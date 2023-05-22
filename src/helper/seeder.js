const { PrismaClient } = require("@prisma/client")
const { hashPassword } = require("./password")

// prisma client
const db = new PrismaClient()

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

module.exports = seedDb
