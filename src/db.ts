import dotenv from "dotenv";
dotenv.config();
import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGO_URL!);

const userScheema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const contentScheema = new Schema({
  title: String,
  link: {type: String, ref: 'tag'},
  userId: {type: mongoose.Types.ObjectId, ref: 'user', required: true}
})

export const contentModel = mongoose.model("content", contentScheema);
export const userModel = mongoose.model("user", userScheema);
