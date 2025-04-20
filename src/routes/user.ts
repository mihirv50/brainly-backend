import { Router } from "express";
import bcrypt from "bcrypt";
import { contentModel, linkModel, userModel } from "../db";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { userMiddleware } from "../middleware";
import { random } from "../utils";
export const userRouter = Router();

userRouter.post("/api/V1/signup", async (req, res) => {
  const requiredBody = z.object({
    username: z.string().min(3).max(15),
    password: z.string().min(8).max(20),
  });
  const parsedData = requiredBody.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      msg: "Incorrect format!",
      error: parsedData.error,
    });
    return;
  }
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 5);
    await userModel.create({
      username: username,
      password: hashedPassword,
    });
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    msg: "Signed Up!",
  });
});

userRouter.post("/api/V1/signin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await userModel.findOne({
      username,
    });
    if (!response) {
      res.status(403).json({
        msg: "User does not exist",
      });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, response.password);
    if (passwordMatch) {
      const token = jwt.sign(
        {
          id: response._id,
        },
        process.env.JWT_SECRET!
      );
      res.json({
        msg: "Signed In!",
        token: token,
      });
    } else {
      res.status(403).json({
        msg: "Incorrect Credentials!",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

userRouter.post("/api/V1/content", userMiddleware, async (req, res) => {
  const { title, link } = req.body;
  try {
    await contentModel.create({
      title: title,
      link: link,
      userId: req.userId,
      tags: [],
    });
  } catch (error) {
    console.log(error);
  }
  res.json({
    msg: "Content Created!",
  });
  return;
});
userRouter.get("/api/V1/content", userMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const Content = await contentModel
      .find({
        userId: userId,
      })
      .populate("userId", "username");
    if (!Content) {
      res.status(403).json({
        msg: "Content not found",
      });
    } else {
      res.json({
        Content,
      });
    }
  } catch (error) {
    console.log(error);
  }
});
userRouter.delete("/api/V1/content", userMiddleware, async (req, res) => {
  const { contentId } = req.body;
  await contentModel.deleteMany({
    contentId: contentId,
    userId: req.userId,
  });
  res.json({
    msg: "Deleted!",
  });
});

userRouter.post("/api/V1/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body;
  if (share) {
    const hash = random(10);
      const existinglink = await linkModel.findOne({
        userId: req.userId
      }) 
      if(existinglink){
        res.json({
          hash
        })
        return;
      }
      
      await linkModel.create({
        userId: req.userId,
        hash: hash,
      });
      res.json({
        hash,
      });
    
  } else {
    await linkModel.deleteOne({
      userId: req.userId,
    });
    res.json({
      msg: "Removed Link",
    });
  }
});

userRouter.get("/api/V1/brain/:sharelink", async (req, res) => {
  const hash = req.params.sharelink;
  const link = await linkModel.findOne({
    hash: hash,
  });
  if (!link) {
    res.status(411).json({
      msg: "Invalid Input",
    });
    return;
  }
  const content = await contentModel.findOne({
    userId: link.userId,
  });
  const user = await userModel.findOne({
    _id: link.userId,
  });
  res.json({
    username: user?.username,
    content: content,
  });
});
