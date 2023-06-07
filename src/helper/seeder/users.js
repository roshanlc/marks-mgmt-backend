const students = [
  {
    email: "student1@pu.edu.np",
    password: "",
    name: "Student Sharma",
    address: "Kathmandu",
    contactNo: "",
    activated: true,
    expired: false,
    symbolNo: "19070130",
    puRegNo: "2018-01-69-6599",
    program: "Computer Engineering",
    syllabus: "Computer Old Syllabus",
    level: "Bachelor",
    semester: 1,
    status: "ACTIVE",
  },
  {
    email: "student2@pu.edu.np",
    password: "",
    name: "Student Sharma",
    address: "Kathmandu",
    contactNo: "",
    activated: true,
    expired: false,
    symbolNo: "19070131",
    puRegNo: "2018-01-69-6199",
    program: "Computer Engineering",
    syllabus: "Computer Old Syllabus",
    level: "Bachelor",
    semester: 1,
    status: "ACTIVE",
  },
]

const teachers = [
  {
    email: "teacher1@pu.edu.np",
    password: "",
    name: "Teacher Sharma",
    address: "Kathmandu",
    contactNo: "",
    activated: true,
    expired: false,
    roles: ["teacher"],
  },
  {
    email: "teacher2@pu.edu.np",
    password: "",
    name: "Teacher Sharma",
    address: "Kathmandu",
    contactNo: "",
    activated: true,
    expired: false,
    roles: ["teacher"],
  },
]

const admins = [
  {
    email: "admin1@pu.edu.np",
    password: "",
    name: "Admin Sharma",
    address: "Kathmandu",
    contactNo: "",
    activated: true,
    expired: false,
    roles: ["admin"],
  },
]

module.exports = { admins, students, teachers }
