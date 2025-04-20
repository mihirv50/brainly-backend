"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const middleware_1 = require("../middleware");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post("/api/V1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(15),
        password: zod_1.z.string().min(8).max(20),
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
        const hashedPassword = yield bcrypt_1.default.hash(password, 5);
        yield db_1.userModel.create({
            username: username,
            password: hashedPassword,
        });
    }
    catch (error) {
        console.log(error);
    }
    res.status(200).json({
        msg: "Signed Up!",
    });
}));
exports.userRouter.post("/api/V1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const response = yield db_1.userModel.findOne({
            username,
        });
        if (!response) {
            res.status(403).json({
                msg: "User does not exist",
            });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, response.password);
        if (passwordMatch) {
            const token = jsonwebtoken_1.default.sign({
                id: response._id,
            }, process.env.JWT_SECRET);
            res.json({
                msg: "Signed In!",
                token: token,
            });
        }
        else {
            res.status(403).json({
                msg: "Incorrect Credentials!",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
exports.userRouter.post("/api/V1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, link } = req.body;
    try {
        yield db_1.contentModel.create({
            title: title,
            link: link,
            userId: req.userId,
            tags: []
        });
    }
    catch (error) {
        console.log(error);
    }
    res.json({
        msg: "Content Created!"
    });
    return;
}));
exports.userRouter.get("/api/V1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const Content = yield db_1.contentModel.find({
            userId: userId
        }).populate("userId", "username");
        if (!Content) {
            res.status(403).json({
                msg: "Content not found"
            });
        }
        else {
            res.json({
                Content
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
exports.userRouter.delete("/api/V1/content", (req, res) => { });
exports.userRouter.post("/api/V1/brain/share", (req, res) => { });
exports.userRouter.get("/api/V1/brain/:sharelink", (req, res) => { });
