export interface ISpecialization {
	id: string;
	name: string;
	createdAt: Date; // ISO Date-time
	updatedAt: Date; // ISO Date-time
}

export interface ISpecializationCreateDto {
	id: string;
	name: string;
}

export type ISpecializationPatchDto = Partial<Omit<ISpecializationCreateDto, 'id'>>;

// Functions

function new_(dto: ISpecializationCreateDto): ISpecialization {
	const now = new Date();
	return {
		id: dto.id,
		name: dto.name,
		createdAt: now,
		updatedAt: now,
	};
}

export default {
	new: new_,
} as const;