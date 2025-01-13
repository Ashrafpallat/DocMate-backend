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
exports.Patient = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const patientSchema = new mongoose_1.Schema({
    name: { type: String, },
    email: { type: String, unique: true },
    age: { type: Number, },
    gender: { type: String, },
    location: { type: String, },
    status: { type: String, default: 'Active' },
    profilePhoto: { type: String },
    password: { type: String, },
    role: {
        type: String,
        default: 'patient', // Set default role as 'patient'
    },
    createdAt: { type: Date, default: Date.now }
});
// Hash the password before saving the Patient model
patientSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const patient = this;
        if (!patient.isModified('password')) {
            return next();
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        patient.password = yield bcrypt_1.default.hash(patient.password, salt);
        next();
    });
});
exports.Patient = (0, mongoose_1.model)('Patient', patientSchema);
