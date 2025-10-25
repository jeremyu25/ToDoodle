import crypto from "crypto"
import express from "express"
import authController from "../controllers/auth.controller.js"
import { verifyToken } from "../utils/verify.js"
import passport from "passport"
import { sendEmail } from '../services/emailService.js'

const router = express.Router()

router.post("/signup", authController.signUp)
router.post("/signin", authController.signIn)
router.post("/signout", authController.signOut)
router.get("/verify", verifyToken, authController.verifyUser)
router.get("/user", verifyToken, authController.getCurrentUser)
router.get("/user/auth-methods", verifyToken, authController.getUserAuthMethods)
router.delete("/delete/:id", verifyToken, authController.deleteUser)
router.get("/verify-email", authController.verifyEmail)
router.post("/resend-verification", authController.resendVerification)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/auth/auth-failure" }),
    authController.googleCallback
)
router.get("/login-failure", (req, res) => {
    res.status(401).json({ message: "Authentication failed" })
})
router.patch("/update-username", verifyToken, authController.updateUsername)
router.patch("/update-password", verifyToken, authController.updatePassword)
router.post("/add-local-password", verifyToken, authController.addLocalPassword)
router.delete("/remove-oauth-method", verifyToken, authController.removeOAuthMethod)
router.patch("/update-email", verifyToken, authController.updateEmail)
router.get("/verify-email-change", authController.verifyEmailChange)
router.get("/pending-email-change", verifyToken, authController.getPendingEmailChange)
router.delete("/pending-email-change", verifyToken, authController.cancelPendingEmailChange)

export default router