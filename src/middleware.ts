import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  try {
    const decoded = jwt.verify(header as string, process.env.JWT_SECRET!);
    if (typeof decoded === "object" && "id" in decoded) {
      req.userId = decoded.id;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
      return 
    }
  } catch (error) {
    console.log(error);
  }
};
