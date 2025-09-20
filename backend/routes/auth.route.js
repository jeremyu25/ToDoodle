import express from "express"
import authController from "../controllers/auth.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

router.post("/signup", authController.signUp)
router.post("/signin", authController.signIn)
router.post("/signout", authController.signOut)
router.get("/verify", verifyToken, authController.verifyUser)
router.delete("/delete", verifyToken, authController.deleteUser)

export default router