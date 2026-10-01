import { Equipment } from '@src/db/models/Equipment'
import { EquipmentPassport } from '@src/db/models/EquipmentPassport'
import { MaintenanceRequest } from '@src/db/models/MaintenanceRequest'
import { RequestAssignee } from '@src/db/models/RequestAssignee'
import { RequestStatusHistory } from '@src/db/models/RequestStatusHistory'
import { Site } from '@src/db/models/Site'
import { Technician } from '@src/db/models/Technician'
import { IEquipment } from '@src/models/Equipment.model'
import { IEquipmentPassport } from '@src/models/EquipmentPassport.model'
import { IAssignee, IMaintenanceRequest } from '@src/models/Maintenance.model'
import { IRequestAssignee } from '@src/models/RequestAssignee.model'
import { IRequestStatusHistory } from '@src/models/RequestStatusHistory.model'
import { ISite } from '@src/models/Site.model'
import { ITechnician } from '@src/models/Technician.model'

// Constants. attributes для include/выборок, чтобы не тянуть лишние колонки

export const PASSPORT_ATTRS = ['id', 'equipmentId', 'manufacturer', 'model', 'nominalPower', 'lastVerificationDate', 'createdAt', 'updatedAt'] as const;
export const TECHNICIAN_ATTRS = ['id', 'fullName', 'specializationId', 'employeeNumber', 'createdAt', 'updatedAt'] as const;
export const ASSIGNEE_THROUGH_ATTRS = ['role', 'plannedHours'] as const;

// Functions

export function map2IPassport(p: EquipmentPassport): IEquipmentPassport {
	return {
		id: p.id,
		equipmentId: p.equipmentId,
		manufacturer: p.manufacturer,
		model: p.model,
		nominalPower: p.nominalPower,
		lastVerificationDate: p.lastVerificationDate,
		createdAt: p.createdAt,
		updatedAt: p.updatedAt,
	};
}

export function map2IEquipment(e: Equipment): IEquipment {
	return {
		id: e.id,
		siteId: e.siteId ?? null,
		serialNumber: e.serialNumber,
		name: e.name,
		type: e.type,
		status: e.status,
		location: { lat: e.lat, lon: e.lon },
		installedAt: e.installedAt,
		createdAt: e.createdAt,
		updatedAt: e.updatedAt,
		...(e.passport !== undefined ? { passport: e.passport ? map2IPassport(e.passport) : null } : {}),
	};
}

export function map2IAssignee(t: Technician): IAssignee {
	const through = t.RequestAssignee;
	return {
		technicianId: t.id,
		fullName: t.fullName,
		role: through?.role ?? 'member',
		plannedHours: through?.plannedHours ?? 0,
	};
}

export function map2IMaintenanceRequest(r: MaintenanceRequest): IMaintenanceRequest {
	return {
		id: r.id,
		equipmentId: r.equipmentId,
		title: r.title,
		...(r.description != null ? { description: r.description } : {}), // null не попадает в ответ, как в Кейсе 2
		priority: r.priority,
		status: r.status,
		...(r.plannedAt ? { plannedAt: r.plannedAt } : {}),
		author: r.author ?? '',
		createdAt: r.createdAt,
		updatedAt: r.updatedAt,
		...(r.assignees ? { assignees: r.assignees.map(map2IAssignee) } : {}),
	};
}

export function map2ISite(s: Site): ISite {
	return {
		id: s.id,
		name: s.name,
		code: s.code,
		region: s.region,
		lat: s.lat,
		lon: s.lon,
		createdAt: s.createdAt,
		updatedAt: s.updatedAt,
	};
}

export function map2ITechnician(t: Technician): ITechnician {
	return {
		id: t.id,
		fullName: t.fullName,
		specializationId: t.specializationId,
		employeeNumber: t.employeeNumber,
		createdAt: t.createdAt,
		updatedAt: t.updatedAt,
	};
}

export function map2IRequestAssignee(a: RequestAssignee): IRequestAssignee {
	return {
		requestId: a.requestId,
		technicianId: a.technicianId,
		role: a.role,
		plannedHours: a.plannedHours,
		createdAt: a.createdAt,
		updatedAt: a.updatedAt,
	};
}

export function map2IHistory(h: RequestStatusHistory): IRequestStatusHistory {
	return {
		id: h.id,
		requestId: h.requestId,
		oldStatus: h.oldStatus,
		newStatus: h.newStatus,
		changedBy: h.changedBy,
		comment: h.comment,
		changedAt: h.changedAt,
	};
}
