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
exports.Doctor = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const doctorSchema = new mongoose_1.Schema({
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    kycVerified: { type: Boolean, default: false },
    locationName: { type: String },
    location: {
        type: {
            type: String, // 'Point'
            enum: ['Point'], // Must be 'Point'
        },
        coordinates: {
            type: [Number], // Array of numbers: [longitude, latitude]
        },
    },
    experience: { type: Number },
    specialization: { type: String },
    gender: { type: String },
    age: { type: Number },
    fees: { type: Number },
    profilePhoto: { type: String },
    status: { type: String, default: 'Active' },
    role: {
        type: String,
        default: 'doctor', // Set default role as 'patient'
    },
}, { timestamps: true });
// Create a geospatial index on the location field
doctorSchema.index({ location: '2dsphere' }); // Index for geospatial queries
doctorSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const doctor = this;
        if (!doctor.isModified('password')) {
            return next();
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        doctor.password = yield bcryptjs_1.default.hash(doctor.password, salt);
        next();
    });
});
exports.Doctor = (0, mongoose_1.model)('Doctor', doctorSchema);
