import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"

// Serialize/Deserialize user for session
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        return done(null, profile)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

export default passport