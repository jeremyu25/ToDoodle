import "dotenv/config.js" // automatically loads .env
import express from "express"
import cors from "cors"
import cookies from "cookie-parser"

import folderRoutes from "./routes/folder.route.js"
import noteRoutes from "./routes/note.route.js"
import userRoutes from "./routes/auth.route.js"
import feedbackRoutes from "./routes/feedback.route.js"
import session from "express-session"
import passport from "./config/passport.js"
import { startCronJobs, stopCronJobs } from "./services/cronJobs.js"

const app = express()

app.use(cors({ 
    credentials: true, 
    origin: [process.env.CLIENT_URL], 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE" 
}))
app.use(express.json())
app.use(cookies())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use("/api/v1/folder", folderRoutes)
app.use("/api/v1/note", noteRoutes)
app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/feedback", feedbackRoutes)

try {
	const port = process.env.PORT
	app.listen(port, () => {
		console.log(`server is up and listening on port ${port}`)
		// Start cron jobs after server is running
		startCronJobs()
	})
} 
catch (err) {
	console.log(err)
}

// Graceful shutdown handling
process.on('SIGINT', () => {
	console.log('\n🛑 Received SIGINT. Graceful shutdown...')
	stopCronJobs()
	process.exit(0)
})

process.on('SIGTERM', () => {
	console.log('\n🛑 Received SIGTERM. Graceful shutdown...')
	stopCronJobs()
	process.exit(0)
})
