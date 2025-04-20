"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    try {
        const decoded = jsonwebtoken_1.default.verify(header, process.env.JWT_SECRET);
        if (typeof decoded === "object" && "id" in decoded) {
            req.userId = decoded.id;
            next();
        }
        else {
            res.status(401).json({ message: "Unauthorized: Invalid token" });
            return;
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.userMiddleware = userMiddleware;
