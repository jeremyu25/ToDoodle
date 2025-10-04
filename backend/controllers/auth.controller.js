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
                <h2 style="color: #A8BBA0;">Welcome to ToDoodle!</h2>
                <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
                <p style="margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #A8BBA0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    This verification link will expire in 10 minutes.
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
                // Generate base username for OAuth users  
                const baseUsername = googleUser.displayName || email.split('@')[0]
                
                user = await AuthModel.createGoogleUser({
                    username: baseUsername,
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
                <h2 style="color: #A8BBA0;">Email Verification</h2>
                <p>Please verify your email address to complete your registration.</p>
                <p style="margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #A8BBA0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    This verification link will expire in 10 minutes.
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

const updateUsername = async (req, res) => {
    try {
        const { userId, username } = req.body
        
        if (!userId || !username) {
            return res.status(400).json({ message: "User ID and username are required" })
        }

        // Check if user is authorized to update this account
        if (req.user.id !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this account" })
        }

        // Validate username
        if (username.length < 3 || username.length > 100) {
            return res.status(400).json({ message: "Username must be between 3 and 100 characters" })
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            return res.status(400).json({ message: "Username must contain only letters and numbers" })
        }

        // Check if username is already taken
        const existingUser = await AuthModel.getUserByUsername(username)
        if (existingUser && existingUser.id !== userId) {
            return res.status(409).json({ message: "Username is already taken" })
        }

        // Update username
        const updatedUser = await AuthModel.updateUsername(userId, username)
        
        res.status(200).json({
            message: "Username updated successfully",
            user: updatedUser
        })
    } catch (error) {
        console.error("Update username error:", error.message)
        return res.status(500).json({ message: "Error updating username" })
    }
}

const updateEmail = async (req, res) => {
    try {
        const { userId, email } = req.body
        
        if (!userId || !email) {
            return res.status(400).json({ message: "User ID and email are required" })
        }

        // Check if user is authorized to update this account
        if (req.user.id !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this account" })
        }

        // Check if user has local auth before allowing email change
        const authMethods = await AuthModel.getUserAuthMethods(userId)
        const hasLocalAuth = authMethods.some(method => method.provider === 'local')
        
        if (!hasLocalAuth) {
            return res.status(400).json({ message: "You must add a password to your account before changing your email address" })
        }

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" })
        }

        if (email.length > 100) {
            return res.status(400).json({ message: "Email must be less than 100 characters" })
        }

        // Get current user info
        const currentUser = await AuthModel.getUserById(req.user.id)
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found" })
        }

        // Check if email is the same as current
        if (email === currentUser.email) {
            return res.status(400).json({ message: "New email must be different from current email" })
        }

        // Check if email is already taken by another user
        const existingUser = await AuthModel.getUserByEmail(email)
        if (existingUser && existingUser.id !== userId) {
            return res.status(409).json({ message: "Email is already taken" })
        }

        // Create pending email change request
        const pendingChange = await AuthModel.createPendingEmailChange(userId, currentUser.email, email)
        
        // Send verification email to NEW email address
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email-change?token=${pendingChange.verification_token}`
        
        await sendEmail(
            email,
            'Verify Your New Email Address - ToDoodle',
            `Please click the following link to verify your new email address: ${verificationUrl}`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #A8BBA0;">Email Address Change Verification</h2>
                <p>You have requested to change your email address on ToDoodle.</p>
                <p><strong>Current email:</strong> ${currentUser.email}</p>
                <p><strong>New email:</strong> ${email}</p>
                <p>Please click the button below to verify your new email address and complete the change:</p>
                <p style="margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #A8BBA0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify New Email Address
                    </a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
                <p style="color: #667; font-size: 14px;">
                    This verification link will expire in 10 minutes.
                </p>
                <p style="color: #667; font-size: 14px;">
                    If you did not request this email change, please ignore this email.
                </p>
            </div>
            `
        )
        
        res.status(200).json({
            message: "Verification email sent to your new email address. Please check your email to complete the change.",
            newEmail: email
        })
    } catch (error) {
        console.error("Update email error:", error.message)
        return res.status(500).json({ message: "Error initiating email change" })
    }
}

const updatePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body
        
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "User ID, current password, and new password are required" })
        }

        // Check if user is authorized to update this account
        if (req.user.id !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this account" })
        }

        // Validate new password
        if (newPassword.length < 8 || newPassword.length > 100) {
            return res.status(400).json({ message: "Password must be between 8 and 100 characters" })
        }

        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({ message: "Password must contain at least one uppercase letter" })
        }

        if (!/[a-z]/.test(newPassword)) {
            return res.status(400).json({ message: "Password must contain at least one lowercase letter" })
        }

        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({ message: "Password must contain at least one number" })
        }

        if (!/[!@#$%^&*]/.test(newPassword)) {
            return res.status(400).json({ message: "Password must contain at least one special character" })
        }

        // Verify current password
        const user = await AuthModel.getUserWithPassword(userId)
        if (!user || !user.password_hash) {
            return res.status(404).json({ message: "User not found or invalid account type" })
        }

        const validPassword = bcryptjs.compareSync(currentPassword, user.password_hash)
        if (!validPassword) {
            return res.status(401).json({ message: "Current password is incorrect" })
        }

        // Hash new password and update
        const hashedPassword = bcryptjs.hashSync(newPassword, 10)
        await AuthModel.updatePassword(userId, hashedPassword)
        
        res.status(200).json({
            message: "Password updated successfully"
        })
    } catch (error) {
        console.error("Update password error:", error.message)
        return res.status(500).json({ message: "Error updating password" })
    }
}

const verifyEmailChange = async (req, res) => {
    try {
        const { token } = req.query
        
        if (!token) {
            return res.status(400).json({ message: "Email change verification token is required" })
        }

        // Verify email change
        const result = await AuthModel.verifyEmailChange(token)
        
        // Send notification email to the OLD email address
        await sendEmail(
            result.oldEmail,
            'Email Address Changed - ToDoodle',
            `Your email address has been successfully changed from ${result.oldEmail} to ${result.newEmail}.`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #A8BBA0;">Email Address Changed</h2>
                <p>This is to notify you that your email address on ToDoodle has been successfully changed.</p>
                <p><strong>Previous email:</strong> ${result.oldEmail}</p>
                <p><strong>New email:</strong> ${result.newEmail}</p>
                <p><strong>Changed on:</strong> ${new Date().toLocaleString()}</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; color: #66; font-size: 14px;">
                        <strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately.
                    </p>
                </div>
                <p style="color: #667; font-size: 14px;">
                    You will now need to use your new email address (${result.newEmail}) to sign in to your account.
                </p>
            </div>
            `
        )
        
        res.status(200).json({ 
            message: "Email address changed successfully! A notification has been sent to your previous email address.",
            user: result.user
        })
    } catch (error) {
        console.error("Email change verification error:", error.message)
        if (error.message.includes("Invalid or expired")) {
            return res.status(400).json({ message: "Invalid or expired email change verification token" })
        }
        return res.status(500).json({ message: "Error verifying email change" })
    }
}

const getPendingEmailChange = async (req, res) => {
    try {
        const userId = req.user.id
        
        const pendingChange = await AuthModel.getPendingEmailChange(userId)
        
        if (!pendingChange) {
            return res.status(404).json({ message: "No pending email change found" })
        }

        // Don't send the verification token to the client
        const { verification_token, ...safePendingChange } = pendingChange
        
        res.status(200).json({
            pendingChange: safePendingChange
        })
    } catch (error) {
        console.error("Get pending email change error:", error.message)
        return res.status(500).json({ message: "Error fetching pending email change" })
    }
}

const cancelPendingEmailChange = async (req, res) => {
    try {
        const userId = req.user.id
        
        const cancelledChange = await AuthModel.cancelPendingEmailChange(userId)
        
        if (!cancelledChange) {
            return res.status(404).json({ message: "No pending email change found to cancel" })
        }
        
        res.status(200).json({
            message: "Email change request cancelled successfully"
        })
    } catch (error) {
        console.error("Cancel pending email change error:", error.message)
        return res.status(500).json({ message: "Error cancelling email change" })
    }
}

const getCurrentUser = async (req, res) => {
    try {
        // The verifyToken middleware already verified the token and set req.user with basic info
        // Now fetch the complete user data from the database
        const userId = req.user.id
        
        const user = await AuthModel.getUserById(userId)
        
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        
        res.status(200).json({
            success: true,
            user: user
        })
    } catch (error) {
        console.error("Get current user error:", error.message)
        return res.status(500).json({ message: "Error fetching user data" })
    }
}

const getUserAuthMethods = async (req, res) => {
    try {
        const userId = req.user.id
        
        const authMethods = await AuthModel.getUserAuthMethods(userId)
        
        res.status(200).json({
            success: true,
            authMethods: authMethods
        })
    } catch (error) {
        console.error("Get user auth methods error:", error.message)
        return res.status(500).json({ message: "Error fetching user auth methods" })
    }
}

const addLocalPassword = async (req, res) => {
    try {
        const { password } = req.body
        const userId = req.user.id
        
        if (!password) {
            return res.status(400).json({ message: "Password is required" })
        }

        // Validate password
        if (password.length < 8 || password.length > 100) {
            return res.status(400).json({ message: "Password must be between 8 and 100 characters" })
        }

        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least one uppercase letter" })
        }

        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least one lowercase letter" })
        }

        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least one number" })
        }

        if (!/[!@#$%^&*]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least one special character" })
        }

        // Check if user already has local auth
        const authMethods = await AuthModel.getUserAuthMethods(userId)
        const hasLocalAuth = authMethods.some(method => method.provider === 'local')
        
        if (hasLocalAuth) {
            return res.status(400).json({ message: "User already has a local password" })
        }

        // Get user data to use email as provider_user_id
        const user = await AuthModel.getUserById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Hash password and create local auth identity
        const hashedPassword = bcryptjs.hashSync(password, 10)
        await AuthModel.linkAuthProvider(userId, 'local', user.email, hashedPassword)
        
        res.status(200).json({
            message: "Local password added successfully"
        })
    } catch (error) {
        console.error("Add local password error:", error.message)
        return res.status(500).json({ message: "Error adding local password" })
    }
}

const removeOAuthMethod = async (req, res) => {
    try {
        const { provider } = req.body
        const userId = req.user.id
        
        if (!provider) {
            return res.status(400).json({ message: "Provider is required" })
        }

        // Don't allow removing local auth if it's the only auth method
        const authMethods = await AuthModel.getUserAuthMethods(userId)
        const hasLocal = authMethods.some(method => method.provider === 'local')
        const oauthMethods = authMethods.filter(method => method.provider !== 'local')
        
        if (provider === 'local') {
            if (oauthMethods.length === 0) {
                return res.status(400).json({ message: "Cannot remove local authentication - it's your only login method" })
            }
        } else {
            // Removing OAuth method - make sure it exists
            const hasThisOAuth = authMethods.some(method => method.provider === provider)
            if (!hasThisOAuth) {
                return res.status(404).json({ message: "OAuth method not found" })
            }
        }

        // Remove the auth method
        const removedMethod = await AuthModel.removeAuthMethod(userId, provider)
        
        if (!removedMethod) {
            return res.status(404).json({ message: "Authentication method not found" })
        }
        
        res.status(200).json({
            message: `${provider} authentication removed successfully`
        })
    } catch (error) {
        console.error("Remove OAuth method error:", error.message)
        return res.status(500).json({ message: "Error removing authentication method" })
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
    resendVerification,
    updateUsername,
    updateEmail,
    updatePassword,
    verifyEmailChange,
    getPendingEmailChange,
    cancelPendingEmailChange,
    getCurrentUser,
    getUserAuthMethods,
    addLocalPassword,
    removeOAuthMethod
}