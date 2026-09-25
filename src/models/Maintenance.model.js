"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("@src/common/utils/validators");
const jet_validators_1 = require("jet-validators");
const utils_1 = require("jet-validators/utils");
const uuid_1 = require("uuid");
const GetDefaults = () => ({
    id: (0, uuid_1.v4)(),
    equipmentId: (0, uuid_1.v4)(),
    title: "Some title",
    description: "Some description for some title",
    priority: "critical",
    status: "new",
    plannedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
});
const schema = {
    id: jet_validators_1.isString,
    equipmentId: jet_validators_1.isString,
    title: jet_validators_1.isString,
    description: jet_validators_1.isString,
    priority: validators_1.isMaintenancePriority,
    status: validators_1.isMaintenanceStatus,
    plannedAt: validators_1.transformIsDate,
    createdAt: validators_1.transformIsDate,
    updatedAt: validators_1.transformIsDate,
};
const parseMaintenanceRequest = (0, utils_1.parseObject)(schema);
const isCompleteMaintenanceRequest = (0, utils_1.testObject)({
    ...schema,
    id: validators_1.isValidUUID,
    title: jet_validators_1.isNonEmptyString,
});
const isNewMaintenanceRequest = (0, utils_1.testObject)({
    equipmentId: validators_1.isValidUUID,
    title: jet_validators_1.isNonEmptyString,
    description: jet_validators_1.isNonEmptyString,
    priority: validators_1.isMaintenancePriority,
    status: validators_1.isMaintenanceStatus,
    plannedAt: (0, utils_1.makeOptional)(validators_1.transformIsDate),
});
const isPartialMaintenanceRequest = (0, utils_1.testObject)({
    title: (0, utils_1.makeOptional)(jet_validators_1.isNonEmptyString),
    description: (0, utils_1.makeOptional)(jet_validators_1.isString),
    priority: (0, utils_1.makeOptional)(validators_1.isMaintenancePriority),
    plannedAt: (0, utils_1.makeOptional)(validators_1.transformIsDate)
});
function new_(maintenanceRequest) {
    return parseMaintenanceRequest({ ...GetDefaults(), ...maintenanceRequest }, (errors) => {
        throw new Error('Setup new maintenance request failed ' + JSON.stringify(errors, null, 2));
    });
}
exports.default = {
    new: new_,
    isComplete: isCompleteMaintenanceRequest,
    isNew: isNewMaintenanceRequest,
    isPartial: isPartialMaintenanceRequest,
};
