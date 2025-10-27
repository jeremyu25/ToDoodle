import "dotenv/config.js";
import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import swaggerUI from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";
import session from "express-session";
import passport from "./config/passport.js";

import folderRoutes from "./routes/folder.route.js";
import noteRoutes from "./routes/note.route.js";
import userRoutes from "./routes/auth.route.js";
import feedbackRoutes from "./routes/feedback.route.js";

const app = express();

app.use(cors({
  credentials: true,
  origin: [process.env.CLIENT_URL],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));
app.use(express.json());
app.use(cookies());

app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/folder", folderRoutes);
app.use("/api/v1/note", noteRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/feedback", feedbackRoutes);

export default app;
