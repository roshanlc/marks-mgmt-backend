const { Router } = require("express")
const router = Router()

// A basic demo enpoint
// only authenticated users are able to view it
router.get("/auth", function authCheckHandler(req, rest) {
  rest.status(200).json({
    message: "You are a valid user.",
  })
  return
})

module.exports = router
