import dotenv from "dotenv";
dotenv.config();
import express, { Application, NextFunction } from "express";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import postRoutes from "./routes/post";
import photoRoutes from "./routes/photos";
import messageRoutes from "./routes/messages";
import notificationRoutes from "./routes/notification";
import postCommentRoutes from "./routes/postComments";
import friendRoutes from "./routes/friends";
import errorHandler from "./utils/errorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";
import BodyParser from "body-parser";
import * as Minio from "minio";
import http from "http";
import setupSocket from "./socket";

const app: Application = express();
const server = http.createServer(app);

setupSocket();

export let minioClient = new Minio.Client({
  endPoint: "127.0.0.1",
  port: 9000,
  useSSL: false,
  accessKey: "7rFfAu4twAyPZfQJ",
  secretKey: "RvCg6e1V5JJwM8nr4NjnNCylz7nUbs3X",
});

app.use(BodyParser.json({ limit: "4mb" }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

//routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", postCommentRoutes);
app.use("/api/followers", friendRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/photos", photoRoutes);

minioClient.bucketExists("social-media", function (error) {
  if (error) {
    throw new Error("MinIO error bucket dosent exist");
  }

  app.listen(process.env.PORT, () => {
    console.log("Server started on port :", process.env.PORT);
  });
});

app.use(errorHandler);
