import express from "express";
import cookies from "cookie-parser";

import folderRoutes from "./routes/folder.route.js";
import noteRoutes from "./routes/note.route.js";
import userRoutes from "./routes/auth.route.js";
import feedbackRoutes from "./routes/feedback.route.js";

const app = express();

app.use(express.json());
app.use(cookies());


app.use("/api/v1/folder", folderRoutes);
app.use("/api/v1/note", noteRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/feedback", feedbackRoutes);

export default app;
