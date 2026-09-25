"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusCodes_1 = __importDefault(require("@src/common/constants/HttpStatusCodes"));
const route_errors_1 = require("@src/common/utils/route-errors");
const MaintenanceRequestRepo_1 = __importDefault(require("@src/repos/MaintenanceRequestRepo"));
const Errors = {
    REQUEST_NOT_FOUND: "Request not found",
    REQUEST_ALREADY_EXISTS: "Request already exists",
    UNACCEPTABLE_TRANSITION: "Invalid request status transition",
};
const AllowedStatusTransitions = {
    new: ['in_progress', 'rejected'],
    in_progress: ['done', 'rejected'],
    done: [],
    rejected: [],
};
const generateNotFoundError = () => new route_errors_1.RouteError(HttpStatusCodes_1.default.NOT_FOUND, Errors.REQUEST_NOT_FOUND, "NOT_FOUND");
function getAll() {
    return MaintenanceRequestRepo_1.default.getAll();
}
async function addOne(request) {
    try {
        await MaintenanceRequestRepo_1.default.add(request);
    }
    catch (err) {
        if (err == "already_exists")
            throw new route_errors_1.RouteError(HttpStatusCodes_1.default.CONFLICT, Errors.REQUEST_ALREADY_EXISTS, "ALREADY_EXISTS");
    }
    return;
}
async function getById(id) {
    const persists = await MaintenanceRequestRepo_1.default.persists(id);
    if (!persists)
        throw generateNotFoundError();
    return MaintenanceRequestRepo_1.default.getOne(id);
}
async function patchOne(id, request) {
    const persists = await MaintenanceRequestRepo_1.default.persists(id);
    if (!persists)
        throw generateNotFoundError();
    return MaintenanceRequestRepo_1.default.update(id, request);
}
async function patchStatus(id, status) {
    const request = await MaintenanceRequestRepo_1.default.getOne(id);
    if (!request)
        throw generateNotFoundError();
    const allowed = AllowedStatusTransitions[request.status] ?? [];
    if (!allowed.includes(status)) {
        throw new route_errors_1.RouteError(HttpStatusCodes_1.default.CONFLICT, Errors.UNACCEPTABLE_TRANSITION, "CONFLICT");
    }
    return MaintenanceRequestRepo_1.default.updateStatus(id, status);
}
async function deleteOne(id) {
    const persists = await MaintenanceRequestRepo_1.default.persists(id);
    if (!persists)
        throw generateNotFoundError();
    return MaintenanceRequestRepo_1.default.delete(id);
}
exports.default = {
    getAll,
    addOne,
    getById,
    patchOne,
    patchStatus,
    deleteOne,
};
