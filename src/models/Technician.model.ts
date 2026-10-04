export interface ITechnician {
	id: string;
	fullName: string;
	specializationId: string;
	employeeNumber: string;
	createdAt: Date; // ISO Date-time
	updatedAt: Date; // ISO Date-time
}

export interface TechnicianCreateDto {
	id: string;
	fullName: string;
	specializationId: string;
	employeeNumber: string;
}

export type TechnicianPatchDto = Partial<Omit<TechnicianCreateDto, 'id'>>;

// Functions

function new_(dto: TechnicianCreateDto): ITechnician {
	const now = new Date();
	return {
		id: dto.id,
		fullName: dto.fullName,
		specializationId: dto.specializationId,
		employeeNumber: dto.employeeNumber,
		createdAt: now,
		updatedAt: now,
	};
}

export default {
	new: new_,
} as const;