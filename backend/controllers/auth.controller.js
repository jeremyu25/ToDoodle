import AuthModel from "../models/auth.model.js"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { sendEmail } from '../services/emailService.js'

const signUp = async (req, res) => {
    try {
        const { username, password, email } = req.body
        if (!username || !password || !email) {
            return res.status(400).json({ message: "Username, password, and email are required" })
        }

        // Check if user already exists in main users table
        const existingUser = await AuthModel.getUserByEmail(email)
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered." })
        }

        // Check if user already exists in staging table
        const existingStagingUser = await AuthModel.getStagingUserByEmail(email)
        if (existingStagingUser) {
            // If token is still valid, inform user to check email
            if (new Date() < new Date(existingStagingUser.verification_expires)) {
                return res.status(409).json({ 
                    message: "Verification email already sent. Please check your email or request a new verification link." 
                })
            }
            // If token expired, we'll create a new one below
        }

        const hashedPassword = bcryptjs.hashSync(password, 10)
        
        // Create staging user with verification token
        const stagingUser = await AuthModel.createStagingUser(username, hashedPassword, email)
        
        // Send verification email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${stagingUser.verification_token}`
        
        await sendEmail(
            email,
            'Verify Your Email - ToDoodle',
            `Please click the following link to verify your email: ${verificationUrl}`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2d89ef;">Welcome to ToDoodle!</h2>
                <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
                <p style="margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #2d89ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    This verification link will expire in 24 hours.
                </p>
            </div>
            `
        )

        res.status(201).json({ 
            message: "Registration successful! Please check your email to verify your account.",
            email: email
        })
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
        
        if ((!username && !email) || !password) {
            return res.status(400).json({message: "Either username or email, and password are required"})
        }
        
        let validUser;
        if (username && email) {
            validUser = await AuthModel.getUser(username, email)
        } else {
            const identifier = email || username
            validUser = await AuthModel.getUser(identifier)
        }
        
        if (!validUser) {
            return res.status(404).json({message: "User not found or credentials don't match"})
        }

        if (!validUser.password_hash) {
            return res.status(401).json({message: "This is not a local password account"})
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

const googleCallback = async (req, res) => {
    try {
        // req.user contains the Google profile from Passport
        const googleUser = req.user
        
        if (!googleUser || !googleUser.emails || !googleUser.emails[0]) {
            throw new Error("Invalid Google user data received")
        }
        
        const email = googleUser.emails[0].value
        const isEmailVerified = googleUser.emails[0].verified
        
        if (!isEmailVerified) {
            throw new Error("Email not verified by Google")
        }
        
        let user = await AuthModel.getUserByProvider('google', googleUser.id)
        
        if (!user) {
            const existingUser = await AuthModel.getUserByEmail(email)
            
            if (existingUser) {
                const existingGoogleAuth = await AuthModel.getUserAuthMethods(existingUser.id)
                const hasGoogleAuth = existingGoogleAuth.some(auth => auth.provider === 'google')
                
                if (hasGoogleAuth) {
                    throw new Error("Google account is already linked to this user")
                }
                
                await AuthModel.linkAuthProvider(existingUser.id, 'google', googleUser.id)
                user = existingUser
            }
            else {
                user = await AuthModel.createGoogleUser({
                    username: (googleUser.displayName || email.split('@')[0]).replace(/\s+/g, '_'),
                    email: email,
                    googleId: googleUser.id
                })
            }
        }
        
        if (!user) {
            throw new Error("Failed to create or retrieve user")
        }
        
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET)
        const expiryDate = new Date(Date.now() + 10800000)
        
        res.cookie("access_token", token, {httpOnly: true, expires: expiryDate})
        
        // Send HTML page that communicates with parent window
        const {password_hash, ...userWithoutPassword} = user
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Successful</title>
            </head>
            <body>
                <script>
                    try {
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth-success',
                                user: ${JSON.stringify(userWithoutPassword)}
                            }, '*');
                            window.close();
                        } else {
                            // Fallback: redirect to frontend
                            window.location.href = '${process.env.CLIENT_URL}/todo';
                        }
                    } catch (error) {
                        console.error('Error communicating with parent:', error);
                        window.location.href = '${process.env.CLIENT_URL}/todo';
                    }
                </script>
                <p>Authentication successful! This window should close automatically.</p>
            </body>
            </html>
        `)
    } catch (error) {
        console.error("Google OAuth callback error:", error)
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Failed</title>
            </head>
            <body>
                <script>
                    try {
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth-error',
                                message: 'Authentication failed. Please try again.'
                            }, '*');
                            window.close();
                        } else {
                            // Fallback: redirect to frontend
                            window.location.href = '${process.env.CLIENT_URL}/signin';
                        }
                    } catch (error) {
                        console.error('Error communicating with parent:', error);
                        window.location.href = '${process.env.CLIENT_URL}/signin';
                    }
                </script>
                <p>Authentication failed. This window should close automatically.</p>
            </body>
            </html>
        `)
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query
        
        if (!token) {
            return res.status(400).json({ message: "Verification token is required" })
        }

        // Verify email and create user
        const user = await AuthModel.verifyEmailAndCreateUser(token)
        
        // Generate JWT token for automatic sign-in
        const authToken = jwt.sign({id: user.id}, process.env.JWT_SECRET)
        const expiryDate = new Date(Date.now() + 10800000) // 3 hours
        
        res.cookie("access_token", authToken, {httpOnly: true, expires: expiryDate})
        
        res.status(200).json({ 
            message: "Email verified successfully! You are now signed in.",
            user: user
        })
    } catch (error) {
        console.error("Email verification error:", error.message)
        if (error.message.includes("Invalid or expired")) {
            return res.status(400).json({ message: "Invalid or expired verification token" })
        }
        return res.status(500).json({ message: "Error verifying email" })
    }
}

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        // Check if user is already verified
        const existingUser = await AuthModel.getUserByEmail(email)
        if (existingUser) {
            return res.status(400).json({ message: "Email is already verified" })
        }

        // Get staging user and regenerate token
        const stagingUser = await AuthModel.regenerateVerificationToken(email)
        
        // Send new verification email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${stagingUser.verification_token}`
        
        await sendEmail(
            email,
            'Verify Your Email - ToDoodle',
            `Please click the following link to verify your email: ${verificationUrl}`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2d89ef;">Email Verification</h2>
                <p>Please verify your email address to complete your registration.</p>
                <p style="margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #2d89ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    This verification link will expire in 24 hours.
                </p>
            </div>
            `
        )

        res.status(200).json({ 
            message: "Verification email sent successfully! Please check your email.",
            email: email
        })
    } catch (error) {
        console.error("Resend verification error:", error.message)
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: "No pending registration found for this email" })
        }
        return res.status(500).json({ message: "Error sending verification email" })
    }
}

export default {
    signUp,
    signIn,
    signOut,
    deleteUser,
    verifyUser,
    googleCallback,
    verifyEmail,
    resendVerification
}