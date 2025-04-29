import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { userRouter } from "./routes/user";
import cors from "cors";
import { configDotenv } from "dotenv";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/V1",userRouter);

app.listen(3000);
