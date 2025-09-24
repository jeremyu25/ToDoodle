import express from "express"
import authController from "../controllers/auth.controller.js"
import { verifyToken } from "../utils/verify.js"
import passport from "passport"

const router = express.Router()

router.post("/signup", authController.signUp)
router.post("/signin", authController.signIn)
router.post("/signout", authController.signOut)
router.get("/verify", verifyToken, authController.verifyUser)
router.delete("/delete", verifyToken, authController.deleteUser)

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/auth/auth-failure" }),
    authController.googleCallback
)
router.get("/login-failure", (req, res) => {
    res.status(401).json({ message: "Authentication failed" })
})

export default router