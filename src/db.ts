import dotenv from "dotenv";
dotenv.config();
import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGO_URL!);

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const contentSchema = new Schema({
  title: String,
  link: {type: String, ref: 'tag'},
  userId: {type: mongoose.Types.ObjectId, ref: 'user', required: true}
})

const linkSchema = new Schema({
  hash:String,
  userId: {type: mongoose.Types.ObjectId, ref:"user", required: true, unique:true}
})

export const contentModel = mongoose.model("content", contentSchema);
export const userModel = mongoose.model("user", userSchema);
export const linkModel = mongoose.model("link", linkSchema);
