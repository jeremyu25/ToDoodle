import AuthModel from "../models/auth.model.js"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

const signUp = async (req, res) => {
    try {
        const { username, password, email } = req.body
        if (!username || !password || !email) {
            return res.status(400).json({ message: "Username, password, and email are required" })
        }
        const hashedPassword = bcryptjs.hashSync(password, 10)
        const newUser = await AuthModel.signUp(username, hashedPassword, email)
        res.status(201).json({ message: "User created successfully", data: newUser })
    } catch (error) {
            switch (error.code) {
        case '23505': // unique_violation
            return res.status(409).json({ message: "Username or email already exists." })
        case '22P02': // invalid_text_representation
            return res.status(400).json({ message: "Invalid data type provided." })
        case '23514': // check_violation
            return res.status(400).json({ message: "Data failed a check constraint." })
        default:
            console.error("Error creating user in database:", error.message)
            return res.status(500).json({ message: "DB error while creating user." })
        }
    }
}

const signIn = async (req, res) => {
    try {
        const { username, password, email } = req.body
        if (!username || !password) {
            return res.status(400).json({message: "Username and password are required"})
        }
        const validUser = await AuthModel.getUser(username)
        if (!validUser) {
            return res.status(404).json({message: "Username not found"})
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password_hash)
        if (!validPassword) {
            return res.status(401).json({message: "Wrong Password entered"})
        }
        const token = jwt.sign({id: validUser.id}, process.env.JWT_SECRET)
        const {password_hash, ...rest} = validUser
        const expiryDate = new Date(Date.now() + 10800000)
        return res
            .cookie("access_token", token, {httpOnly: true, expires: expiryDate})
            .status(200)
            .json({
                success: true,
                user: rest
            })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const signOut = async (req, res) => {
    try {
        res.clearCookie("access_token")
        res.status(200).json({ message: "User signed out successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const verifyUser = async (req, res) => {
    try {
        // The verifyToken middleware already verified the token and set req.user
        // We just need to return success
        res.status(200).json({ 
            success: true, 
            message: "User is authenticated",
            user: req.user
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const deleteUser = async (req, res) => {
    if (req.user.id !== req.query.id) {
        return res.status(403).json({message: "You are not authorized to delete this user"})
    }
    try {
        const results = await AuthModel.deleteUser(req.query.id)
        return res.status(200).json({
            message: "User deleted successfully",
            data: results
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export default {
    signUp,
    signIn,
    signOut,
    deleteUser,
    verifyUser
}