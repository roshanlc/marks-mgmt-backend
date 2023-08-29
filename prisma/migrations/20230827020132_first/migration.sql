-- CreateEnum
CREATE TYPE "Season" AS ENUM ('FALL', 'SPRING', 'WINTER', 'SUMMER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'DROPOUT', 'ARCHIVE');

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "contactNo" TEXT,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "expired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoles" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "head" TEXT,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "head" TEXT,
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "head" TEXT,
    "departmentId" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "programId" INTEGER NOT NULL,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramSemesters" (
    "programId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,

    CONSTRAINT "ProgramSemesters_pkey" PRIMARY KEY ("programId","semesterId")
);

-- CreateTable
CREATE TABLE "RunningSemesters" (
    "programId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "batchId" INTEGER NOT NULL,

    CONSTRAINT "RunningSemesters_pkey" PRIMARY KEY ("programId","semesterId","batchId")
);

-- CreateTable
CREATE TABLE "MarkWeightage" (
    "id" SERIAL NOT NULL,
    "theory" INTEGER NOT NULL,
    "practical" INTEGER NOT NULL,

    CONSTRAINT "MarkWeightage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "credit" INTEGER NOT NULL,
    "elective" BOOLEAN NOT NULL DEFAULT false,
    "project" BOOLEAN NOT NULL DEFAULT false,
    "markWeightageId" INTEGER,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectiveCourse" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "ElectiveCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCourses" (
    "programId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "syllabusId" INTEGER NOT NULL,

    CONSTRAINT "ProgramCourses_pkey" PRIMARY KEY ("programId","semesterId","syllabusId","courseId")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "season" "Season" NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "symbolNo" TEXT NOT NULL,
    "puRegNo" TEXT NOT NULL,
    "yearJoined" INTEGER NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "programId" INTEGER NOT NULL,
    "syllabusId" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramHead" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "programId" INTEGER,

    CONSTRAINT "ProgramHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamHead" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "facultyId" INTEGER,

    CONSTRAINT "ExamHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentMarks" (
    "theory" INTEGER,
    "practical" INTEGER,
    "NotQualified" BOOLEAN NOT NULL DEFAULT false,
    "absent" BOOLEAN NOT NULL DEFAULT false,
    "expelled" BOOLEAN NOT NULL DEFAULT false,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "teacherId" INTEGER,
    "batchId" INTEGER,

    CONSTRAINT "StudentMarks_pkey" PRIMARY KEY ("studentId","courseId")
);

-- CreateTable
CREATE TABLE "TeacherCourses" (
    "teacherId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "batchId" INTEGER NOT NULL,
    "programId" INTEGER NOT NULL,

    CONSTRAINT "TeacherCourses_pkey" PRIMARY KEY ("teacherId","courseId","programId","batchId")
);

-- CreateTable
CREATE TABLE "StudentStatus" (
    "status" "Status" NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "StudentStatus_pkey" PRIMARY KEY ("studentId","status")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles_userId_roleId_key" ON "UserRoles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_name_key" ON "Faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Level_name_key" ON "Level"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Program_name_key" ON "Program"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramSemesters_programId_key" ON "ProgramSemesters"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramSemesters_programId_semesterId_key" ON "ProgramSemesters"("programId", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "RunningSemesters_programId_semesterId_batchId_key" ON "RunningSemesters"("programId", "semesterId", "batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ElectiveCourse_code_key" ON "ElectiveCourse"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ElectiveCourse_name_key" ON "ElectiveCourse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCourses_programId_semesterId_syllabusId_courseId_key" ON "ProgramCourses"("programId", "semesterId", "syllabusId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_year_season_key" ON "Batch"("year", "season");

-- CreateIndex
CREATE UNIQUE INDEX "Student_symbolNo_key" ON "Student"("symbolNo");

-- CreateIndex
CREATE UNIQUE INDEX "Student_puRegNo_key" ON "Student"("puRegNo");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramHead_programId_key" ON "ProgramHead"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamHead_userId_key" ON "ExamHead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentMarks_studentId_courseId_key" ON "StudentMarks"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherCourses_teacherId_courseId_programId_batchId_key" ON "TeacherCourses"("teacherId", "courseId", "programId", "batchId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentStatus_studentId_status_key" ON "StudentStatus"("studentId", "status");

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSemesters" ADD CONSTRAINT "ProgramSemesters_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSemesters" ADD CONSTRAINT "ProgramSemesters_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunningSemesters" ADD CONSTRAINT "RunningSemesters_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunningSemesters" ADD CONSTRAINT "RunningSemesters_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunningSemesters" ADD CONSTRAINT "RunningSemesters_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_markWeightageId_fkey" FOREIGN KEY ("markWeightageId") REFERENCES "MarkWeightage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectiveCourse" ADD CONSTRAINT "ElectiveCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourses" ADD CONSTRAINT "ProgramCourses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourses" ADD CONSTRAINT "ProgramCourses_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourses" ADD CONSTRAINT "ProgramCourses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourses" ADD CONSTRAINT "ProgramCourses_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramHead" ADD CONSTRAINT "ProgramHead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramHead" ADD CONSTRAINT "ProgramHead_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamHead" ADD CONSTRAINT "ExamHead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamHead" ADD CONSTRAINT "ExamHead_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentMarks" ADD CONSTRAINT "StudentMarks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentMarks" ADD CONSTRAINT "StudentMarks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentMarks" ADD CONSTRAINT "StudentMarks_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentMarks" ADD CONSTRAINT "StudentMarks_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCourses" ADD CONSTRAINT "TeacherCourses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCourses" ADD CONSTRAINT "TeacherCourses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCourses" ADD CONSTRAINT "TeacherCourses_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCourses" ADD CONSTRAINT "TeacherCourses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentStatus" ADD CONSTRAINT "StudentStatus_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
