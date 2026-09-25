"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.RouteError = void 0;
const crypto_1 = require("crypto");
const HttpStatusCodes_1 = __importDefault(require("@src/common/constants/HttpStatusCodes"));
function generateRequestId() {
    return (0, crypto_1.randomBytes)(4).toString('hex');
}
class RouteError extends Error {
    constructor(status, message, code = RouteError.DEFAULT_CODE, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
    toResponseBody() {
        return {
            error: {
                code: this.code,
                message: this.message,
                ...(this.details ? { details: this.details } : {}),
                requestId: generateRequestId(),
            },
        };
    }
}
exports.RouteError = RouteError;
RouteError.DEFAULT_CODE = 'INTERNAL_ERROR';
class ValidationError extends RouteError {
    constructor(errors) {
        const details = errors.map((error) => ({
            field: error.key ?? error.keyPath.join('.'),
            message: error.info,
        }));
        super(HttpStatusCodes_1.default.BAD_REQUEST, ValidationError.MESSAGE, ValidationError.CODE, details);
    }
}
exports.ValidationError = ValidationError;
ValidationError.MESSAGE = 'Некорректные данные запроса';
ValidationError.CODE = 'VALIDATION_ERROR';
