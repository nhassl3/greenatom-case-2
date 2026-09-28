import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES } from '@src/common/utils/validators'
import { v4 } from 'uuid'

// Types

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export interface ILocation {
	lat: number;
	lon: number;
}

/**
 * @entity equipment
*/
export interface IEquipment {
	id: string; // @PK UUID
	name: string; // @REQUIRED
	type: EquipmentType;
	serialNumber: string; // @UNIQUE
	location: ILocation;
	status: EquipmentStatus;
	installedAt: string; // ISO Date-time, not in future
};
export interface EquipmentCreateDto {
	name: string;
	type: EquipmentType;
	serialNumber: string;
	location: ILocation;
	status?: EquipmentStatus;
	installedAt?: Date;
}

export type EquipmentPatchDto = Partial<Omit<EquipmentCreateDto, 'location'>> & {
	location?: Partial<ILocation>;
};

export type IEquipmentPatch = Partial<Omit<IEquipment, 'id' | 'location'>> & {
	location?: Partial<ILocation>;
};

// Functions

function new_(dto: EquipmentCreateDto): IEquipment {
	return {
		id: v4(),
		name: dto.name,
		type: dto.type,
		serialNumber: dto.serialNumber,
		location: { lat: dto.location.lat, lon: dto.location.lon },
		status: dto.status ?? 'operational',
		installedAt: (dto.installedAt ?? new Date()).toISOString(),
	};
}

export default {
	new: new_,
} as const;
