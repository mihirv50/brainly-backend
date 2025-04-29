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
const utils_1 = require("../utils");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.userRouter.post("/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, link } = req.body;
    try {
        yield db_1.contentModel.create({
            title: title,
            link: link,
            userId: req.userId,
            tags: [],
        });
    }
    catch (error) {
        console.log(error);
    }
    res.json({
        msg: "Content Created!",
    });
    return;
}));
exports.userRouter.get("/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const Content = yield db_1.contentModel
            .find({
            userId: userId,
        })
            .populate("userId", "username");
        if (!Content) {
            res.status(403).json({
                msg: "Content not found",
            });
        }
        else {
            res.json({
                Content,
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
exports.userRouter.delete("/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contentId } = req.body;
    yield db_1.contentModel.deleteMany({
        contentId: contentId,
        userId: req.userId,
    });
    res.json({
        msg: "Deleted!",
    });
}));
exports.userRouter.post("/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (share) {
        const hash = (0, utils_1.random)(10);
        const existinglink = yield db_1.linkModel.findOne({
            userId: req.userId
        });
        if (existinglink) {
            res.json({
                hash
            });
            return;
        }
        yield db_1.linkModel.create({
            userId: req.userId,
            hash: hash,
        });
        res.json({
            hash,
        });
    }
    else {
        yield db_1.linkModel.deleteOne({
            userId: req.userId,
        });
        res.json({
            msg: "Removed Link",
        });
    }
}));
exports.userRouter.get("/brain/:sharelink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.sharelink;
    const link = yield db_1.linkModel.findOne({
        hash: hash,
    });
    if (!link) {
        res.status(411).json({
            msg: "Invalid Input",
        });
        return;
    }
    const content = yield db_1.contentModel.findOne({
        userId: link.userId,
    });
    const user = yield db_1.userModel.findOne({
        _id: link.userId,
    });
    res.json({
        username: user === null || user === void 0 ? void 0 : user.username,
        content: content,
    });
}));
