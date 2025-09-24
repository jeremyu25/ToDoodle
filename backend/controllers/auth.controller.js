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

export default {
    signUp,
    signIn,
    signOut,
    deleteUser,
    verifyUser,
    googleCallback
}