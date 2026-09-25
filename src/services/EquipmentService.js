"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusCodes_1 = __importDefault(require("@src/common/constants/HttpStatusCodes"));
const route_errors_1 = require("@src/common/utils/route-errors");
const EquipmentRepo_1 = __importDefault(require("@src/repos/EquipmentRepo"));
const MaintenanceRequestRepo_1 = __importDefault(require("@src/repos/MaintenanceRequestRepo"));
const Errors = {
    EQUIPMENT_NOT_FOUND: 'Equipment not found',
};
const generateNotFoundError = () => {
    return new route_errors_1.RouteError(HttpStatusCodes_1.default.NOT_FOUND, Errors.EQUIPMENT_NOT_FOUND, "NOT_FOUND");
};
function getAll() {
    return EquipmentRepo_1.default.getAll();
}
function addOne(equipment) {
    return EquipmentRepo_1.default.add(equipment);
}
function getOne(id) {
    return EquipmentRepo_1.default.getOne(id);
}
async function updateOne(id, equipment) {
    const persists = await EquipmentRepo_1.default.persists(id);
    if (!persists)
        throw generateNotFoundError();
    return EquipmentRepo_1.default.updateOne(id, equipment);
}
async function deleteOne(id) {
    const persists = await EquipmentRepo_1.default.persists(id);
    if (!persists)
        throw generateNotFoundError();
    return EquipmentRepo_1.default.delete(id);
}
async function getEquipmentRequests(id) {
    const persists = await EquipmentRepo_1.default.persists(id);
    if (!persists)
        throw generateNotFoundError();
    return MaintenanceRequestRepo_1.default.getAllRequestsByEqipmentId(id);
}
async function getEquipmentWeather(id) {
    const persists = await EquipmentRepo_1.default.persists(id);
    if (!persists)
        throw generateNotFoundError();
    return EquipmentRepo_1.default.getOne(id);
}
exports.default = {
    getAll,
    addOne,
    getOne,
    updateOne,
    deleteOne,
    getEquipmentRequests,
    getEquipmentWeather,
};
