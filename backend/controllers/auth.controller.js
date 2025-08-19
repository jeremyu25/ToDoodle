const AuthModel = require("../models/auth.model.js");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = await AuthModel.signUp(username, hashedPassword)
        res.status(201).json({ message: "User created successfully", data: newUser });
    } catch (error) {
        if (error.code === 23505) { // PSQL duplicate key error code
            return res.status(409).json({ message: 'Username is already taken' });
        }
        return res.status(500).json({ message: error.message });
    }
}

const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        const validUser = await AuthModel.getUser(username)
        if (!validUser) {
            return res.status(404).json({message: "Username not found"})
        }
        const validPassword = bcryptjs.compareSync(password, validUser[0].password_hash)

        if (!validPassword) {
            return res.status(401).json({message: "Wrong Password entered"})
        }
        const token = jwt.sign({id: validUser[0].id}, process.env.JWT_SECRET)
        const {password: password_hash, ...rest} = validUser[0]
        const expiryDate = new Date(Date.now() + 10800000)
        return res
            .cookie('access_token', token, {httpOnly: true, expires: expiryDate})
            .status(200)
            .json(rest)
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const signOut = async (req, res) => {
    try {
        res.clearCookie('access_token')
        res.status(200).json({ message: "User signed out successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message });
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
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


const deleteUser = async (req, res) => {
    if (req.user.id !== req.query.id) {
        return res.status(403).json({message: "You are not authorized to delete this user"})
    }
    try {
        await AuthModel.deleteUser(req.query.id)
        console.log(req.query.id)
        return res.status(200).json({message: "User deleted successfully"})
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    signUp,
    signIn,
    signOut,
    deleteUser,
    verifyUser
}