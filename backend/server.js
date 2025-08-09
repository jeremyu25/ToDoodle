require("dotenv").config();

const express = require("express")

const app = express()

var cookies = require("cookie-parser");

const folderRoutes = require('./routes/folder.route')
const noteRoutes = require('./routes/note.route')
const userRoutes = require('./routes/auth.route')

app.use(express.json())
app.use(cookies())
app.use("/api/v1/folder", folderRoutes)
app.use("/api/v1/note", noteRoutes)
app.use("/api/v1/auth", userRoutes)

try{
    const port = process.env.PORT
    app.listen(port, () => {
    console.log(`server is up and listening on port ${port}`)
    });
}

catch(err){
    console.log(err)
}
