import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { userRouter } from "./routes/user";
import { configDotenv } from "dotenv";

const app = express();

app.use(express.json());

app.use("/user",userRouter);

app.listen(3000);
