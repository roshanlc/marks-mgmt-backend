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

const soft_old_courses = [
  {
    semester: 1,
    courses: [
      {
        course_title: "Engineering Maths I",
        code: "MTH 112",
        credits: 3,
      },
      {
        course_title: "Problem Solving Techniques",
        code: "CMP 114",
        credits: 3,
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
        course_title: "Fundamentals of IT",
        code: "CMP 110",
        credits: 2,
      },
      {
        course_title: "Physics",
        code: "PHY 111",
        credits: 4,
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
        course_title: "Mathematical Foundation of Computer Science",
        code: "MTH 130",
        credits: 3,
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
        course_title: "Logic Circuits",
        code: "ELX 212",
        credits: 3,
      },
      {
        course_title: "Web Technology",
        code: "CMP 213",
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
        course_title: "Software Engineering Fundamentals",
        code: "CMP 220",
        credits: 3,
      },
      {
        course_title: "Probability and Queuing Theory",
        code: "MTH 221",
        credits: 3,
      },
      {
        course_title: "Programming in Java",
        code: "CMP 212",
        credits: 3,
      },
      {
        course_title: "Microprocessor and Assembly Language Programming",
        code: "CMP 214",
        credits: 3,
      },
    ],
  },
  {
    semester: 4,
    courses: [
      {
        code: "MTH 230",
        credits: 3,
        course_title: "Numerical Methods",
      },
      {
        code: "CMP 241",
        credits: 3,
        course_title: "Computer Graphics",
      },
      {
        code: "CMP 334",
        credits: 3,
        course_title: "Computer Organization and Architecture",
      },
      {
        code: "CMP 226",
        credits: 3,
        course_title: "Database Management Systems",
      },
      {
        code: "CMP 321",
        credits: 3,
        course_title: "Object Oriented Design and Modeling through UML",
      },
      {
        code: "CMP 290",
        credits: 1,
        course_title: "Project I",
      },
    ],
  },
  {
    semester: 5,

    courses: [
      {
        code: "CMP 331",
        credits: 3,
        course_title: "Applied Operating Systems",
      },
      {
        code: "CMP 350",
        credits: 3,
        course_title: "Simulation and Modeling",
      },
      {
        code: "CMP 457",
        credits: 3,
        course_title: "Artificial Intelligence and Neural Networks",
      },
      {
        code: "MGT 321",
        credits: 2,
        course_title: "Organization and Management",
      },
      {
        code: "CMP 325",
        credits: 3,
        course_title: "Analysis and Design of Algorithms",
      },
      {
        code: "CMP 311",
        credits: 3,
        course_title: "System Programming",
      },
    ],
  },
  {
    semester: 6,

    courses: [
      {
        code: "CMP 335",
        credits: 3,
        course_title: "Computer Networks",
      },
      {
        code: "CMP 312",
        credits: 3,
        course_title: "Principles of Programming Languages",
      },
      {
        code: "ECO 411",
        credits: 3,
        course_title: "Engineering Economics",
      },
      {
        code: "CMP 322",
        credits: 3,
        course_title: "Object Oriented Software Development",
      },
      {
        code: "CMP 341",
        credits: 3,
        course_title: "Multimedia Systems",
      },
      {
        code: "CMP 390",
        credits: 2,
        course_title: "Project II",
      },
    ],
  },
  {
    semester: 7,

    courses: [
      {
        code: "CMP 430",
        credits: 3,
        course_title: "Real Time Systems",
      },
      {
        code: "CMP 435",
        credits: 3,
        course_title: "Distributed Systems",
      },
      {
        code: "CMP 480",
        credits: 3,
        course_title: "Enterprise Application Development",
      },
      {
        code: "CMP 441",
        credits: 3,
        course_title: "Image Processing and Pattern Recognition",
      },
      {
        code: "CMP 421",
        credits: 3,
        course_title:
          "Software Testing, Verification, Validation and Quality Assurance",
      },
      {
        code: "",
        credits: 3,
        course_title: "Elective I",
      },
    ],
  },
  {
    semester: 8,

    courses: [
      {
        code: "CMP 436",
        credits: 3,
        course_title: "Network Programming",
      },
      {
        code: "CMP 420",
        credits: 3,
        course_title: "Software Project Management",
      },
      {
        code: "",
        credits: 3,
        course_title: "Elective II",
      },
      {
        code: "CMP 490",
        credits: 5,
        course_title: "Project III",
      },
    ],
  },
]

const markWeightage = [
  {
    theory: 30,
    practical: 20,
  },
]
module.exports = { markWeightage, old_comp_courses, soft_old_courses }
