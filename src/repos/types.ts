import { IEquipment, IEquipmentPatch } from '@src/models/Equipment.model'
import { IMaintenanceRequest, IMaintenanceRequestChanges } from '@src/models/Maintenance.model'

// Types

export interface ListQuery<F> {
	filter: F;
	sort?: string;
	page: number;
	limit: number;
}

export interface ListResult<T> {
	items: T[];
	total: number;
}

export interface EquipmentFilter {
	status?: string;
	type?: string;
	installedFrom?: Date;
	installedTo?: Date;
}

export interface RequestFilter {
	status?: string;
	priority?: string;
	equipmentId?: string;
	createdFrom?: Date;
	createdTo?: Date;
	plannedFrom?: Date;
	plannedTo?: Date;
}

// Interfaces

export interface IEquipmentRepo {
	findMany(q: ListQuery<EquipmentFilter>): Promise<ListResult<IEquipment>>;
	findById(id: string): Promise<IEquipment | null>;
	findBySerialNumber(serial: string): Promise<IEquipment | null>;
	create(e: IEquipment): Promise<IEquipment>;
	update(id: string, patch: IEquipmentPatch): Promise<IEquipment | null>;
	delete(id: string): Promise<boolean>;
}

export interface IMaintenanceRequestRepo {
	findMany(q: ListQuery<RequestFilter>): Promise<ListResult<IMaintenanceRequest>>;
	findById(id: string): Promise<IMaintenanceRequest | null>;
	countByEquipmentAndStatuses(equipmentId: string, statuses: readonly string[]): Promise<number>;
	create(r: IMaintenanceRequest): Promise<IMaintenanceRequest>;
	update(id: string, patch: IMaintenanceRequestChanges): Promise<IMaintenanceRequest | null>;
	delete(id: string): Promise<boolean>;
}
