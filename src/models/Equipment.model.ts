import { v4 as uuid } from 'uuid'
import { EquipmentStatus, EquipmentType, ILocation } from './common/general'
import { IEquipmentPassport } from './EquipmentPassport.model'

// Types

/**
 * @entity equipment
*/
export interface IEquipment {
	id: string; // @PK UUID
	siteId: string | null; // @FK ISite.id, optional
	name: string; // @REQUIRED
	type: EquipmentType;
	serialNumber: string; // @UNIQUE
	location: ILocation;
	status: EquipmentStatus;
	installedAt: Date; // ISO Date-time, not in future
	createdAt: Date; // ISO Date-time
	updatedAt: Date; // ISO Date-time
	passport?: IEquipmentPassport | null; // только в карточке
};
export interface EquipmentCreateDto {
	siteId?: string | null;
	name: string;
	type: EquipmentType;
	serialNumber: string;
	location: ILocation;
	status?: EquipmentStatus;
	installedAt?: Date;
}

export type IEquipmentPatchDto = Partial<Omit<EquipmentCreateDto, 'location'>> & { location?: Partial<ILocation> };

// Functions

function new_(dto: EquipmentCreateDto): IEquipment {
	return {
		id: uuid(),
		siteId: dto.siteId ?? null,
		name: dto.name,
		type: dto.type,
		serialNumber: dto.serialNumber,
		location: dto.location,
		status: dto.status ?? 'operational',
		installedAt: (dto.installedAt ?? new Date()),
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

export default {
	new: new_,
} as const;
