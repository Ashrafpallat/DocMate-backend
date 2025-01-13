"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    chatId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ["patient", "doctor"], required: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
}, { timestamps: true });
exports.Message = (0, mongoose_1.model)('Message', MessageSchema);
