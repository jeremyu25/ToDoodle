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
router.delete("/delete", verifyToken, authController.deleteUser)
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
router.patch("/update-email", verifyToken, authController.updateEmail)
router.get("/verify-email-change", authController.verifyEmailChange)
router.get("/pending-email-change", verifyToken, authController.getPendingEmailChange)
router.delete("/pending-email-change", verifyToken, authController.cancelPendingEmailChange)

router.post("/test_mail", async (req, res) => {
    try {
        const { email } = req.body
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' })
        }

        const code = crypto.randomInt(100000, 999999).toString();

        await sendEmail(
            email,
            '2FA Test Email - ToDoodle',
            `Your verification code is: ${code}`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Email Verification</h2>
                <p>This is your 2FA verification code:</p>
                <p style="font-size: 24px; font-weight: bold; color: #2d89ef;">${code}</p>
                <p>This code will expire in 10 minutes.</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
            `
        )

        res.json({ 
            message: 'Test email sent successfully',
            recipient: email,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Test email error:', error)
        res.status(500).json({ 
            error: 'Failed to send test email',
            details: error.message 
        })
    }
})

export default router