import "dotenv/config.js" // automatically loads .env
import express from "express"
import cors from "cors"
import cookies from "cookie-parser"
import swaggerUI from "swagger-ui-express"
import YAML from "yaml"
import fs from "fs"

import folderRoutes from "./routes/folder.route.js"
import noteRoutes from "./routes/note.route.js"
import userRoutes from "./routes/auth.route.js"
import feedbackRoutes from "./routes/feedback.route.js"
import session from "express-session"
import passport from "./config/passport.js"

const app = express()

app.use(cors({ 
    credentials: true, 
    origin: ["http://localhost:5173","http://localhost:3200"], 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE" 
}))
app.use(express.json())
app.use(cookies())

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use("/api/v1/folder", folderRoutes)
app.use("/api/v1/note", noteRoutes)
app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/feedback", feedbackRoutes)

const file = fs.readFileSync("../docs/openapi.yaml", "utf-8")
const swaggerDocument = YAML.parse(file)
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))

try {
	const port = process.env.PORT
	app.listen(port, () => {
		console.log(`server is up and listening on port ${port}`)
	})
} 
catch (err) {
	console.log(err)
}
