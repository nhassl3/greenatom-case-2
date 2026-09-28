import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES, REQUEST_PRIORITIES, REQUEST_STATUSES } from '@src/common/utils/validators'

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export interface ILocation {
	lat: number;
	lon: number;
}
