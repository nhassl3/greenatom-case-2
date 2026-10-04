
// Types


/**
 * @entity site
*/
export interface ISite {
	id: string;
	name: string;
	code: string;
	region: string;
	lat: number;
	lon: number;
	createdAt: Date; // ISO Date-time
	updatedAt: Date; // ISO Date-time
}

export interface SiteCreateDto {
	id: string;
	name: string;
	code: string;
	region: string;
	lat: number;
	lon: number;
}

export type SitePatchDto = Partial<Omit<SiteCreateDto, 'id'>>;

// Functions

function new_(dto: SiteCreateDto): ISite {
	return {
		id: dto.id,
		name: dto.name,
		code: dto.code,
		region: dto.region,
		lat: dto.lat,
		lon: dto.lon,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

export default {
	new: new_,
} as const;