require("dotenv").config()

const express = require("express")
const cors = require("cors")
const cookies = require("cookie-parser")

const app = express()

const folderRoutes = require("./routes/folder.route")
const noteRoutes = require("./routes/note.route")
const userRoutes = require("./routes/auth.route")

app.use(cors({ credentials: true, origin: "http://localhost:5173", methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }))
app.use(express.json())
app.use(cookies())
app.use("/api/v1/folder", folderRoutes)
app.use("/api/v1/note", noteRoutes)
app.use("/api/v1/auth", userRoutes)

try {
	const port = process.env.PORT
	app.listen(port, () => {
		console.log(`server is up and listening on port ${port}`)
	})
} 
catch (err) {
	console.log(err)
}
