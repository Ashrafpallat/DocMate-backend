"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = __importDefault(require("cloudinary"));
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwvguo1mz',
    api_key: process.env.CLOUDINARY_API_KEY || '696832819334472',
    api_secret: process.env.CLOUDINARY_API_SECRET || "lo-rRVej-5q83WJBKfoGWHmqN6E",
});
exports.default = cloudinary_1.default;
