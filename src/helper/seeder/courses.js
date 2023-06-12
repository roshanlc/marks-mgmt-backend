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

const old_comp_courses = [
  {
    semester: 1,
    courses: [
      {
        course_title: "Engineering Maths I",
        code: "MTH 112",
        credits: 3,
      },
      {
        course_title: "Chemistry",
        code: "CHM 111",
        credits: 4,
      },
      {
        course_title: "Communication Technique",
        code: "ENG 111",
        credits: 2,
      },
      {
        course_title: "Programming in C",
        code: "CMP 113",
        credits: 3,
      },
      {
        course_title: "Basic Electrical Engineering",
        code: "ELE 110",
        credits: 3,
      },
      {
        course_title: "Mechanical Workshop",
        code: "MEC 110",
        credits: 1,
      },
    ],
  },

  {
    semester: 2,
    courses: [
      {
        course_title: "Engineering Maths II",
        code: "MTH 114",
        credits: 3,
      },
      {
        course_title: "Physics",
        code: "PHY 111",
        credits: 4,
      },
      {
        course_title: "Engineering Drawing",
        code: "MEC 120",
        credits: 2,
      },
      {
        course_title: "Object Oriented Programming in C++",
        code: "CMP 115",
        credits: 3,
      },
      {
        course_title: "Thermal Science",
        code: "MEC 111",
        credits: 2,
      },
      {
        course_title: "Applied Mechanics I",
        code: "MEC 130",
        credits: 3,
      },
    ],
  },
  {
    semester: 3,
    courses: [
      {
        course_title: "Engineering Maths III",
        code: "MTH 212",
        credits: 3,
      },
      {
        course_title: "Data Structure and Algorithm",
        code: "CMP 225",
        credits: 3,
      },
      {
        course_title: "Electrical Engineering Materials",
        code: "ELE 210",
        credits: 2,
      },
      {
        course_title: "Network Theory",
        code: "ELE 211",
        credits: 3,
      },
      {
        course_title: "Electronics Devices and Circuits",
        code: "ELX 211",
        credits: 3,
      },
      {
        course_title: "Logic Circuits",
        code: "ELX 212",
        credits: 3,
      },
    ],
  },
  {
    semester: 4,
    courses: [
      {
        course_title: "Engineering Maths IV",
        code: "MTH 214",
        credits: 3,
      },
      {
        course_title: "Instrumentation",
        code: "ELX 231",
        credits: 3,
      },
      {
        course_title: "Database Management System",
        code: "CMP 226",
        credits: 3,
      },
      {
        course_title: "Programming Technology",
        code: "CMP 211",
        credits: 3,
      },
      {
        course_title: "Microprocessor",
        code: "ELX 230",
        credits: 3,
      },
      {
        course_title: "Project I",
        code: "CMP 290",
        elective: false,
        project: true,
        credits: 1,
      },
    ],
  },
  {
    semester: 5,

    courses: [
      {
        course_title: "Numerical Methods",
        code: "MTH 230",
        credits: 3,
      },
      {
        course_title: "Probability and Statistics",
        code: "MTH 220",
        credits: 3,
      },
      {
        course_title: "Operating System",
        code: "CMP 330",
        credits: 3,
      },
      {
        course_title: "Computer Architecture",
        code: "CMP 332",
        credits: 3,
      },
      {
        course_title: "Computer Graphics",
        code: "CMP 241",
        credits: 3,
      },
      {
        course_title: "Theory of Computation",
        code: "CMP 326",
        credits: 3,
      },
    ],
  },
  {
    semester: 6,

    courses: [
      {
        course_title: "Simulation and Modeling",
        code: "CMP 350",
        credits: 3,
      },
      {
        course_title: "Data Communication",
        code: "CMP 340",
        credits: 3,
      },
      {
        course_title: "Object Oriented Software Engineering",
        code: "CMP 320",
        credits: 3,
      },
      {
        course_title: "Embedded Systems",
        code: "ELX 312",
        credits: 3,
      },
      {
        course_title: "Elective I",
        code: "",
        elective: true,
        project: false,
        credits: 3,
      },
      {
        course_title: "Project II",
        code: "CMP 390",
        elective: false,
        project: true,
        credits: 2,
      },
    ],
  },
  {
    semester: 7,

    courses: [
      {
        course_title: "Engineering Economics",
        code: "ECO 441",
        credits: 3,
      },
      {
        course_title: "Image Processing and Pattern Recognition",
        code: "CMP 441",
        credits: 3,
      },
      {
        course_title: "Artificial Intelligence",
        code: "CMP 455",
        credits: 3,
      },
      {
        course_title: "Computer Networks",
        code: "CMP 335",
        credits: 3,
      },
      {
        course_title: "ICT Project Management",
        code: "CMP 483",
        credits: 3,
      },
      {
        course_title: "Elective II",
        code: "",
        elective: true,
        project: false,
        credits: 3,
      },
    ],
  },
  {
    semester: 8,

    courses: [
      {
        course_title: "Digital Signal Analysis and Processing",
        code: "CMM 442",
        credits: 3,
      },
      {
        course_title: "Social and Professional Issues in IT",
        code: "CMP 484",
        credits: 2,
      },
      {
        course_title: "Organization and Management",
        code: "MGT 321",
        credits: 2,
      },
      {
        course_title: "Information System",
        code: "CMP 481",
        credits: 3,
      },
      {
        course_title: "Elective III",
        code: "",
        elective: true,
        project: false,
        credits: 3,
      },
      {
        course_title: "Project III",
        code: "CMP 490",
        elective: false,
        project: true,
        credits: 5,
      },
    ],
  },
]

const new_comp_coures = []

const markWeightage = [
  {
    theory: 30,
    practical: 20,
  },
]
module.exports = { courses, markWeightage, old_comp_courses }
