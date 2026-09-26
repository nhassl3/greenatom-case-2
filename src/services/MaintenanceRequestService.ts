import { AlreadyExistsError, ConflictError, NotFoundError } from '@src/common/errors'
import { IMaintenanceRequest, IMaintenanceRequestPatch } from '@src/models/Maintenance.model'
import MaintenanceRequestRepo from '@src/repos/MaintenanceRequestRepo'

// Constatns
const Errors = {
	REQUEST_NOT_FOUND: "Request not found",
	REQUEST_ALREADY_EXISTS: "Request already exists",
	UNACCEPTABLE_TRANSITION: "Invalid request status transition",
} as const;

const AllowedStatusTransitions: Record<string, readonly string[]> = {
	new: ['in_progress', 'rejected'], // new -> in_progress -> done; new -> rejected;
	in_progress: ['done', 'rejected'], // in_progress -> rejected, in_progress -> done;
	done: [],
	rejected: [],
};

// Functions


function getAll(): Promise<IMaintenanceRequest[]> {
	return MaintenanceRequestRepo.getAll();
}

async function addOne(request: IMaintenanceRequest): Promise<void> {
	try {
		await MaintenanceRequestRepo.add(request)
	} catch (err) {
		if (err == "already_exists") throw new AlreadyExistsError(Errors.REQUEST_ALREADY_EXISTS);
	}
	return;
}

async function getById(id: string): Promise<IMaintenanceRequest | null> {
	const persists = await MaintenanceRequestRepo.persists(id);
	if (!persists) throw new NotFoundError(Errors.REQUEST_NOT_FOUND);
	return MaintenanceRequestRepo.getOne(id);
}

async function patchOne(id: string, request: IMaintenanceRequestPatch): Promise<void> {
	const persists = await MaintenanceRequestRepo.persists(id);
	if (!persists) throw new NotFoundError(Errors.REQUEST_NOT_FOUND);
	return MaintenanceRequestRepo.update(id, request);
}

async function patchStatus(id: string, status: string): Promise<void> {
	const request = await MaintenanceRequestRepo.getOne(id);
	if (!request) throw new NotFoundError(Errors.REQUEST_NOT_FOUND);
	const allowed = AllowedStatusTransitions[request.status] ?? [];
	if (!allowed.includes(status)) {
		throw new ConflictError(Errors.UNACCEPTABLE_TRANSITION);
	}
	return MaintenanceRequestRepo.updateStatus(id, status);
}

async function deleteOne(id: string): Promise<void> {
	const persists = await MaintenanceRequestRepo.persists(id);
	if (!persists) throw new NotFoundError(Errors.REQUEST_NOT_FOUND);
	return MaintenanceRequestRepo.delete(id);
}


export default {
	getAll,
	addOne,
	getById,
	patchOne,
	patchStatus,
	deleteOne,
} as const;