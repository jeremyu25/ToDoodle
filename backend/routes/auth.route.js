const express = require("express")

const router = express.Router()

const authController = require('../controllers/auth.controller.js')

router.post('/signup', authController.signUp)

router.post('/signin', authController.signIn)

router.post('/signout', authController.signOut)

router.delete('/delete', authController.deleteUser)

module.exports = router