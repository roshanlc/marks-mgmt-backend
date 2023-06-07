const courses = [
  {
    name: "Programming in C",
    code: "COMP 333",
    credit: 3,
    elective: false,
    project: false,
    markWeightage: { theory: 30, practical: 20 },
  },
  {
    name: "OOP with C++",
    code: "COMP 334",
    credit: 3,
    elective: false,
    project: false,
    markWeightage: { theory: 30, practical: 20 },
  },
  {
    name: "DBMS",
    code: "COMP 354",
    credit: 3,
    elective: false,
    project: false,
    markWeightage: { theory: 30, practical: 20 },
  },
]

const markWeightage = [
  {
    theory: 30,
    practical: 20,
  },
]
module.exports = { courses, markWeightage }
