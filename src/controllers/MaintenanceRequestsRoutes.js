"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusCodes_1 = __importDefault(require("@src/common/constants/HttpStatusCodes"));
const validators_1 = require("@src/common/utils/validators");
const Maintenance_model_1 = __importDefault(require("@src/models/Maintenance.model"));
const MaintenanceRequestService_1 = __importDefault(require("@src/services/MaintenanceRequestService"));
const jet_validators_1 = require("jet-validators");
const utils_1 = require("jet-validators/utils");
const parseReq_1 = __importDefault(require("./common/parseReq"));
const reqValidators = {
    add: (0, parseReq_1.default)({ maintenance: Maintenance_model_1.default.isNew }),
    getOne: (0, parseReq_1.default)({ id: (0, utils_1.transform)(String, jet_validators_1.isString) }),
    patch: (0, parseReq_1.default)({ maintenance: Maintenance_model_1.default.isPartial }),
    delete: (0, parseReq_1.default)({ id: (0, utils_1.transform)(String, jet_validators_1.isString) }),
    patchStatus: (0, parseReq_1.default)({ status: validators_1.isMaintenanceStatus }),
};
async function get(_, res) {
    const requests = await MaintenanceRequestService_1.default.getAll();
    res.status(HttpStatusCodes_1.default.OK).json({ requests });
}
async function add(req, res) {
    const { maintenance } = reqValidators.add(req.body);
    await MaintenanceRequestService_1.default.addOne(Maintenance_model_1.default.new(maintenance));
    res.status(HttpStatusCodes_1.default.CREATED).end();
}
async function getById(req, res) {
    const { id } = reqValidators.getOne(req.params);
    const request = await MaintenanceRequestService_1.default.getById(id);
    res.status(HttpStatusCodes_1.default.OK).json({ request });
}
async function patch(req, res) {
    const { id } = reqValidators.getOne(req.params);
    const { maintenance } = reqValidators.patch(req.body);
    await MaintenanceRequestService_1.default.patchOne(id, maintenance);
    res.status(HttpStatusCodes_1.default.OK).end();
}
async function patchStatus(req, res) {
    const { id } = reqValidators.getOne(req.params);
    const { status } = reqValidators.patchStatus(req.body);
    await MaintenanceRequestService_1.default.patchStatus(id, status);
    res.status(HttpStatusCodes_1.default.OK).end();
}
async function delete_(req, res) {
    const { id } = reqValidators.delete(req.params);
    await MaintenanceRequestService_1.default.deleteOne(id);
    res.status(HttpStatusCodes_1.default.OK).end();
}
exports.default = {
    get,
    add,
    getById,
    patch,
    patchStatus,
    delete: delete_,
};
