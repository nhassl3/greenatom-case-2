// Types

/**
 * @entity equipment_passport
 */
export interface IEquipmentPassport {
	id: string; // @PK UUID
	equipmentId: string; // @FK IEquipment.id;
	manufacturer: string;
	model: string;
	nominalPower: number;
	lastVerificationDate: string | null; // yyyy-mm-dd
	createdAt: Date; // ISO Date-time
	updatedAt: Date; // ISO Date-time
}

export interface EquipmentPassportCreateDto {
	id: string;
	equipmentId: string;
	manufacturer: string;
	model: string;
	nominalPower: number;
	lastVerificationDate: string; // yyyy-mm-dd
}

export type EquipmentPassportPatchDto = Partial<Omit<EquipmentPassportCreateDto, 'id'>>;

// Functions

function new_(dto: EquipmentPassportCreateDto): IEquipmentPassport {
	return {
		id: dto.id,
		equipmentId: dto.equipmentId,
		manufacturer: dto.manufacturer,
		model: dto.model,
		nominalPower: dto.nominalPower,
		lastVerificationDate: dto.lastVerificationDate,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

export default {
	new: new_,
} as const;