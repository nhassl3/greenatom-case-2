"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusCodes_1 = __importDefault(require("@src/common/constants/HttpStatusCodes"));
function health(_, res) {
    res.status(HttpStatusCodes_1.default.OK).json({ "status": "ok" });
}
exports.default = {
    health,
};
