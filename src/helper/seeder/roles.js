const roles = [
  {
    name: "student",
    description:
      "The student has access to viewing personal profile and one's marks only",
  },
  {
    name: "teacher",
    description:
      "The teacher can add, modify and view marks of students for the courses taught.",
  },
  {
    name: "programHead",
    description:
      "The program head can view marks of all students enrolled in the program.",
  },
  {
    name: "examHead",
    description:
      "The internal exam head can view, modify and export marks of all students in the system",
  },

  {
    name: "admin",
    description:
      "The admin has all permissions in the system. Further, admin can add other users.",
  },
]

module.exports = { roles }
