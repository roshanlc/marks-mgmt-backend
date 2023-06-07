const semesters = [1, 2, 3, 4, 5, 6, 7, 8]

const level = [{ name: "Bachelor" }, { name: "Master" }]
const faculties = [
  {
    name: "Faculty of Science and Technology",
    head: "",
  },
  {
    name: "Faculty of Management",
    head: "",
  },
]

const departments = [
  {
    name: "Department of Computer and Software Engineering",
    head: "",
    faculty: "Faculty of Science and Technology",
  },
  {
    name: "Department of Civil Engineering",
    head: "",
    faculty: "Faculty of Science and Technology",
  },
]

const programs = [
  {
    name: "Computer Engineering",
    level: "Bachelor",
    department: "Department of Computer and Software Engineering",
  },
  {
    name: "Software Engineering",
    level: "Bachelor",
    department: "Department of Computer and Software Engineering",
  },
]

const programSemesters = [
  { program: "Computer Engineering", level: "Bachelor", semester: 8 },
  { program: "Software Engineering", level: "Bachelor", semester: 8 },
]

const programSyllabus = [
  {
    name: "Computer Old Syllabus",
    program: "Computer Engineering",
    level: "Bachelor",
  },
  {
    name: "Computer New Syllabus",
    program: "Computer Engineering",
    level: "Bachelor",
  },
  {
    name: "Software Old Syllabus",
    program: "Software Engineering",
    level: "Bachelor",
  },
  {
    name: "Software New Syllabus",
    program: "Software Engineering",
    level: "Bachelor",
  },
]

module.exports = {
  departments,
  programs,
  programSemesters,
  faculties,
  level,
  semesters,
  programSyllabus,
}
