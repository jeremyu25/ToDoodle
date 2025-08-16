const express = require("express")

const router = express.Router()

const authController = require('../controllers/auth.controller.js')

const { verifyToken } = require('../utils/verify');

router.post('/signup', authController.signUp)

router.post('/signin', authController.signIn)

router.post('/signout', authController.signOut)

router.delete('/delete',[verifyToken], authController.deleteUser)

router.get('/verify', verifyToken, authController.verifyUser)


module.exports = router