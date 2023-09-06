/**
 * This module contains db functions related to upgrading batch which includes incrementing semester of all student
 * and so on.
 */

const { PrismaClient, Prisma } = require("@prisma/client")
const db = new PrismaClient()
const logger = require("../../helper/logger")
const { toResult } = require("../../helper/result")
const {
  internalServerError,
  errorResponse,
  NotFoundError,
  badRequestError,
} = require("../../helper/error")
const { getLatestBatch } = require("./others")

// upgrade from current batch to next batch (targeted Batch)
async function upgradeBatch(targetBatchId) {
  // Jumps from current batch to target Batch
  // and sets target batch as current one

  try {
    const currentBatch = await getLatestBatch()

    if (currentBatch.err !== null) {
      return currentBatch
    }
    // check if target batch already exists
    const targetBatch = await db.batch.findFirstOrThrow({
      where: { id: targetBatchId },
    })

    if (targetBatch.id === currentBatch.result.id || targetBatch.used) {
      return toResult(
        null,
        badRequestError("You cannot upgrade to same batch.")
      )
    }

    // update the table of running semester to have latest data
    const updateSems = await updateRunningSemesters()

    if (updateSems.err !== null) {
      return updateSems.err
    }

    // fetch running semesters for each program and then work on it
    const programs = await db.program.findMany({
      include: {
        ProgramSemesters: true,
        RunningSemesters: true,
        ProgramCourses: true,
      },
    })

    // update student details of each program
    for (const prog of programs) {
      // keep the list of semester which have been processed
      const semsDone = []

      const maxSem = prog.ProgramSemesters[0]?.semesterId || 0 // final semester of a program

      if (maxSem === 0) {
        break
      }

      for (const semester of prog.RunningSemesters) {
        if (semester.semesterId === maxSem) {
          // move final year students to arhive mode
          const studentStatus = await db.studentStatus.updateMany({
            where: {
              student: {
                AND: [
                  { programId: prog.id },
                  { semesterId: semester.semesterId },
                ],
              },
              status: "ACTIVE",
            },
            data: { status: "ARCHIVE" },
          })

          // also make their account expired
          const usersUpdate = await db.user.updateMany({
            where: {
              Student: {
                some: {
                  AND: [
                    { programId: prog.id },
                    { semesterId: semester.semesterId },
                  ],
                },
              },
            },
            data: { expired: true },
          })

          console.log(usersUpdate) // remove later
        } else if (semester.semesterId < maxSem) {
          const nextSem = semester.semesterId + 1 // semester to upgrade to

          // courses for the next sem
          const coursesForNextSem = prog.ProgramCourses.filter(
            (item) => item.semesterId === nextSem
          )

          // fetch student list
          const studentsForProgSem = await db.student.findMany({
            where: {
              programId: prog.id,
              semesterId: semester.semesterId,
              StudentStatus: { some: { status: "ACTIVE" } },
            },
          })

          // array to keep create promises
          let markEntries = []

          // for each course, create marks entries of all students
          for (const course of coursesForNextSem) {
            for (const student of studentsForProgSem) {
              if (
                course.syllabusId === student.syllabusId &&
                course.semesterId === nextSem
              ) {
                const entry = {
                  studentId: student.id,
                  courseId: course.courseId,
                  batchId: targetBatch.id,
                  theory: 0,
                  practical: 0,
                  NotQualified: false,
                }

                // add the entry to an array
                markEntries.push(entry)
              }
            }
          }

          // also add marks entries in StudentMarks table for each student
          const addMarkEntries = await db.studentMarks.createMany({
            data: markEntries,
          })

          // upgrade their semesters
          const updateSem = await db.student.updateMany({
            where: {
              programId: prog.id,
              semesterId: { lt: maxSem },
              StudentStatus: { some: { status: "ACTIVE" } },
            },
            data: { semesterId: { increment: 1 } },
          })
        }

        semsDone.push(semester)
      }
    }

    // set current batch to false
    await db.batch.update({
      where: { id: currentBatch.result.id },
      data: { current: false, used: true },
    })

    // set target batch as current batch
    const setCurrentBatch = await db.batch.update({
      where: { id: targetBatch.id },
      data: { current: true, used: true },
    })

    return toResult(setCurrentBatch, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. Please update method to update the resource.`
        )
      )
    } else if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(
        null,
        NotFoundError(`Please provide valid details. ${err?.meta?.cause}`)
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something went wrong with request. ${err.message}`)
      )
    } else {
      console.log(err) // log purpose
      logger.warn(`upgradeBatch(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * It will figure out the running semesters for each program in
 * latest batch and create their entries in RunningSemesters table
 */
async function updateRunningSemesters() {
  try {
    const latestBatch = await getLatestBatch()

    if (latestBatch.err !== null) {
      return latestBatch
    }

    // delete all entries from running semesters table
    await db.runningSemesters.deleteMany({})

    // fetch all program with their supported max semesters
    const program = await db.program.findMany({
      include: { ProgramSemesters: true },
    })

    for (const prog of program) {
      const semesters = await db.student.findMany({
        where: {
          StudentMarks: { some: { batchId: latestBatch.result.id } },
          StudentStatus: { some: { status: "ACTIVE" } },
          programId: prog.id,
        },
        distinct: ["semesterId"],
        select: { semesterId: true, programId: true },
      })

      for (const sem of semesters) {
        const result = await db.runningSemesters.upsert({
          where: {
            programId_semesterId_batchId: {
              programId: prog.id,
              batchId: latestBatch.result.id,
              semesterId: sem.semesterId,
            },
          },
          create: {
            ...sem,
            batchId: latestBatch.result.id,
          },

          update: {
            ...sem,
            batchId: latestBatch.result.id,
          },
        })
      }
    }

    const runningSems = await db.runningSemesters.findMany({
      where: { batchId: latestBatch.result.id },
    })

    return toResult(runningSems, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. Please update method to update the resource.`
        )
      )
    } else if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(
        null,
        NotFoundError(`Please provide valid details. ${err?.meta?.cause}`)
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something went wrong with request. ${err.message}`)
      )
    } else {
      logger.warn(`findRunningSemesters(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}

/**
 * Enable or disable marks collection for the current semester/batch
 * @param {boolean} toggle
 * @returns
 */
async function currentBatchMarksToggle(toggle = false) {
  try {
    const latestBatch = await getLatestBatch()

    if (latestBatch.err !== null) {
      return latestBatch
    }

    const result = await db.batch.update({
      where: { id: latestBatch.result.id },
      data: { marksCollect: toggle },
    })

    return toResult(result, null)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return toResult(
        null,
        errorResponse(
          "Conflict",
          `Resource already exists. Please update method to update the resource.`
        )
      )
    } else if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return toResult(
        null,
        NotFoundError(`Please provide valid details. ${err?.meta?.cause}`)
      )
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return toResult(
        null,
        badRequestError(`Something went wrong with request. ${err.message}`)
      )
    } else {
      logger.warn(`currentBatchMarksToggle(): ${err.message}`) // Always log cases for internal server error
      return toResult(null, internalServerError())
    }
  }
}
module.exports = {
  updateRunningSemesters,
  upgradeBatch,
  currentBatchMarksToggle,
}
