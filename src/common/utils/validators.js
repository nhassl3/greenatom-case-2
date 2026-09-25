"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUUID = exports.transformIsDateNotInFuture = exports.transformIsDate = void 0;
exports.isEquipmentType = isEquipmentType;
exports.isEquipmentStatus = isEquipmentStatus;
exports.isMaintenanceStatus = isMaintenanceStatus;
exports.isMaintenancePriority = isMaintenancePriority;
const jet_validators_1 = require("jet-validators");
const utils_1 = require("jet-validators/utils");
const uuid_1 = require("uuid");
const equipmentTypes = ['turbine', 'inverter', 'sensor', 'substation'];
const equipmentStatuses = ['operational', 'maintenance', 'fault', 'decommissioned'];
const maintenanceStatuses = ['new', 'in_progress', 'done', 'rejected'];
const maintenancePriority = ['low', 'medium', 'high', 'critical'];
exports.transformIsDate = (0, utils_1.transform)((arg) => new Date(arg), (arg) => (0, jet_validators_1.isDate)(arg));
function isEquipmentType(value) {
    return equipmentTypes.includes(value);
}
function isEquipmentStatus(value) {
    return equipmentStatuses.includes(value);
}
exports.transformIsDateNotInFuture = (0, utils_1.transform)((arg) => new Date(arg), (arg) => (0, jet_validators_1.isDate)(arg) && arg <= new Date());
function isMaintenanceStatus(value) {
    return maintenanceStatuses.includes(value);
}
function isMaintenancePriority(value) {
    return maintenancePriority.includes(value);
}
exports.isValidUUID = (0, utils_1.transform)((arg) => arg, (arg) => (0, jet_validators_1.isNonEmptyString)(arg) && (0, uuid_1.validate)(arg));
