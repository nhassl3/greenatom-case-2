import { v4 } from 'uuid'
import { EquipmentStatus, EquipmentType, ILocation } from './common/general'

// Types

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
