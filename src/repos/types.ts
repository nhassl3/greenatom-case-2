import { EquipmentCreateDto, IEquipment, IEquipmentPatchDto } from '@src/models/Equipment.model'
import { IMaintenanceRequest, RequestCreateDto, RequestPatchDto } from '@src/models/Maintenance.model'
import { IRequestAssignee } from '@src/models/RequestAssignee.model'
import { IRequestStatusHistory, RequestStatusHistoryCreateDto } from '@src/models/RequestStatusHistory.model'
import { ISite } from '@src/models/Site.model'
import { ITechnician } from '@src/models/Technician.model'
import { RequestAssigneeRole, RequestStatus } from '@src/models/common/general'
import { TxOpts } from './common/tx'

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

export interface ReadOpts extends TxOpts {
	lock?: 'update' | 'share'; // требует tx
}

export interface AssigneeInput {
	technicianId: string;
	role: RequestAssigneeRole;
	plannedHours: number;
}

export interface SiteSummary {
	siteId: string;
	byStatus: { status: RequestStatus; count: number }[];
	byPriority: { priority: string; count: number }[];
	avgCloseHours: number | null;
}

export interface EquipmentLoadQuery {
	from: Date;
	to: Date;
	minRequests: number;
	sort?: string;
	limit: number;
	offset: number;
}

export interface EquipmentLoadRow {
	id: string;
	name: string;
	serialNumber: string;
	siteCode: string | null;
	requestsTotal: number;
	requestsClosed: number;
	plannedHoursTotal: number;
	lastServiceAt: Date | null;
}

// Interfaces

export interface IEquipmentRepo {
	findMany(q: ListQuery<EquipmentFilter>, opts?: TxOpts): Promise<ListResult<IEquipment>>;
	findById(id: string, opts?: ReadOpts): Promise<IEquipment | null>;
	findBySerialNumber(serial: string, opts?: TxOpts): Promise<IEquipment | null>;
	create(e: EquipmentCreateDto, opts?: TxOpts): Promise<IEquipment>;
	update(id: string, patch: IEquipmentPatchDto, opts?: TxOpts): Promise<IEquipment | null>;
	delete(id: string, opts?: TxOpts): Promise<boolean>;
}

export interface IMaintenanceRequestRepo {
	findMany(q: ListQuery<RequestFilter>, opts?: TxOpts): Promise<ListResult<IMaintenanceRequest>>;
	findById(id: string, opts?: TxOpts): Promise<IMaintenanceRequest | null>;
	findByIdForUpdate(id: string, tx: NonNullable<TxOpts['tx']>): Promise<IMaintenanceRequest | null>;
	countByEquipmentAndStatuses(equipmentId: string, statuses: readonly string[], opts?: TxOpts): Promise<number>;
	create(r: RequestCreateDto, opts?: TxOpts): Promise<IMaintenanceRequest>;
	update(id: string, patch: RequestPatchDto, opts?: TxOpts): Promise<IMaintenanceRequest | null>;
	delete(id: string, opts?: TxOpts): Promise<boolean>;
}

// Журнал только добавляется: update/delete намеренно отсутствуют
export interface IRequestStatusHistoryRepo {
	append(entry: Omit<RequestStatusHistoryCreateDto, 'id' | 'changedAt'> & { changedAt?: Date }, opts?: TxOpts): Promise<IRequestStatusHistory>;
	findByRequest(requestId: string, opts?: TxOpts): Promise<IRequestStatusHistory[]>;
}

export interface IRequestAssigneeRepo {
	replaceForRequest(requestId: string, items: AssigneeInput[], opts?: TxOpts): Promise<void>;
	remove(requestId: string, technicianId: string, opts?: TxOpts): Promise<boolean>;
	countByRequest(requestId: string, opts?: TxOpts): Promise<number>;
	findByRequest(requestId: string, opts?: TxOpts): Promise<IRequestAssignee[]>;
}

export interface ITechnicianRepo {
	findByIds(ids: string[], opts?: TxOpts): Promise<string[]>; // существующие id
	findById(id: string, opts?: TxOpts): Promise<ITechnician | null>;
}

export interface ISiteRepo {
	findById(id: string, opts?: TxOpts): Promise<ISite | null>;
	getSummary(siteId: string, opts?: TxOpts): Promise<SiteSummary>;
}

export interface IReportRepo {
	equipmentLoad(q: EquipmentLoadQuery, opts?: TxOpts): Promise<ListResult<EquipmentLoadRow>>;
}

