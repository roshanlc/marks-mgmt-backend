const permissions = [
  {
    name: "readPersonalMarks",
    description:
      "Allows a user to view only their own marks for all semesters.",
  },
  {
    name: "readAllMarks",
    description: "Allows a user to view marks of all students.",
  },
  {
    name: "readCourseMarks",
    description:
      "An user (teacher) will be able to view the marks of the course they teach.",
  },
  {
    name: "writeCourseMarks",
    description:
      "write/modify student marks: Allows a user to modify the marks of students for the courses they teach.",
  },
  {
    name: "manageCourses",
    description:
      "Manage courses: Allows a user to create, update, and delete courses.",
  },
  {
    name: "addNonAdminusers",
    description: "add non-admin users",
  },
  {
    name: "addAdminUsers",
    description: "add admin users",
  },
  {
    name: "modifyUserPerms",
    description:
      "Modify user permissions: Allows a user to upgrade the permissions of other users.",
  },
  {
    name: "upgradeSemester",
    description:
      "Manage semesters: Allows a user to update the semesters of students when a new semester starts.",
  },
  {
    name: "manageAdmin",
    description:
      "Delete admin profiles: Allows a user to add/modify/delete admin profiles from the system.",
  },
  {
    name: "assignCourses",
    description:
      "Assign teachers to courses: Allows a user to assign teachers to specific courses.",
  },
  {
    name: "isSuperAdmin",
    description:
      "User has all the permissions of the system. Someone with this permission can do anything in the system",
  },
]

const roles = [
  { name: "student", permissions: ["readPersonalMarks"] },
  { name: "teacher", permissions: ["readCourseMarks", "writeCourseMarks"] },
  { name: "admin", permissions: ["isSuperAdmin"] },
]

module.exports = { permissions, roles }
