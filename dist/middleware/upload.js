"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// middleware/upload.ts
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the folder where files should be uploaded
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Store files with a unique name
    },
});
const upload = (0, multer_1.default)({ storage });
exports.upload = upload;
