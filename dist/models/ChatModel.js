"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = require("mongoose");
const ChatSchema = new mongoose_1.Schema({
    patient: { type: mongoose_1.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose_1.Schema.Types.ObjectId, ref: "Doctor", required: true },
    lastMessage: { type: mongoose_1.Schema.Types.ObjectId, ref: "Message", default: null }, // Referencing the Message model
    lastMessageTime: { type: Date, default: null },
    patientLastSeen: { type: Date, default: null },
    doctorLastSeen: { type: Date, default: null },
}, { timestamps: true });
exports.Chat = (0, mongoose_1.model)('Chat', ChatSchema);
