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
const defaultTokenModel_1 = require("../models/defaultTokenModel");
const moment_1 = __importDefault(require("moment"));
function resetOutdatedSlots(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentDate = new Date().setHours(0, 0, 0, 0);
            const today = (0, moment_1.default)().format('dddd');
            const { doctorId } = req.params; // Extract doctorId from route params
            console.log('at reset slot', doctorId);
            const token = yield defaultTokenModel_1.DefaultTokenModel.findOne({
                doctorId: doctorId,
                day: today
            });
            if (token) {
                let isUpdated = false;
                token.slots.forEach(slot => {
                    if (slot.status !== 'issued' &&
                        new Date(new Date(slot.statusUpdatedAt).setHours(0, 0, 0, 0)) < new Date(currentDate)) {
                        slot.status = 'issued';
                        slot.statusUpdatedAt = new Date();
                        slot.patientId = undefined;
                        isUpdated = true;
                    }
                });
                if (isUpdated) {
                    yield token.save();
                    console.log('updated');
                }
                console.log('end of reset slot');
            }
            next();
        }
        catch (error) {
            console.log('error at rest slote mdlwr', error);
        }
    });
}
exports.default = resetOutdatedSlots;
