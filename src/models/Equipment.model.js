"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("@src/common/utils/validators");
const jet_validators_1 = require("jet-validators");
const utils_1 = require("jet-validators/utils");
const uuid_1 = require("uuid");
const GetDefaults = () => ({
    id: (0, uuid_1.v4)(),
    name: "Name",
    type: "sensor",
    serialNumber: "A1",
    location: {
        lat: 0,
        lon: 0,
    },
    status: "operational",
    installedAt: new Date(),
});
const schema = {
    id: validators_1.isValidUUID,
    name: jet_validators_1.isString,
    type: validators_1.isEquipmentType,
    serialNumber: jet_validators_1.isString,
    location: {
        lat: jet_validators_1.isInteger,
        lon: jet_validators_1.isInteger,
    },
    status: validators_1.isEquipmentStatus,
    installedAt: validators_1.transformIsDateNotInFuture,
};
;
const parseEquipment = (0, utils_1.parseObject)(schema);
const isNewEquipment = (0, utils_1.testObject)({
    name: jet_validators_1.isNonEmptyString,
    type: validators_1.isEquipmentType,
    serialNumber: jet_validators_1.isString,
    location: {
        lat: jet_validators_1.isInteger,
        lon: jet_validators_1.isInteger,
    },
    status: validators_1.isEquipmentStatus,
});
const isPartialEquipment = (0, utils_1.testObject)({
    name: (0, utils_1.makeOptional)(jet_validators_1.isNonEmptyString),
    type: (0, utils_1.makeOptional)(validators_1.isEquipmentType),
    serialNumber: (0, utils_1.makeOptional)(jet_validators_1.isString),
    location: (0, utils_1.makeOptional)((0, utils_1.testObject)({
        lat: (0, utils_1.makeOptional)(jet_validators_1.isInteger),
        lon: (0, utils_1.makeOptional)(jet_validators_1.isInteger),
    })),
    status: (0, utils_1.makeOptional)(validators_1.isEquipmentStatus),
    installedAt: (0, utils_1.makeOptional)(validators_1.transformIsDateNotInFuture),
});
function new_(equipment) {
    return parseEquipment({ ...GetDefaults(), ...equipment }, (errors) => {
        throw new Error("Setup new user failed " + JSON.stringify(errors, null, 2));
    });
}
exports.default = {
    new: new_,
    isNew: isNewEquipment,
    isPartial: isPartialEquipment,
};
