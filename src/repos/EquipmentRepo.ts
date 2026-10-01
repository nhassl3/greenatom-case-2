import { Equipment, EquipmentPassport } from '@src/db/models'
import { EquipmentCreateDto, IEquipment, IEquipmentPatchDto } from '@src/models/Equipment.model'
import { col, fn, Includeable, Transaction, where, WhereOptions } from 'sequelize'
import { map2IEquipment, PASSPORT_ATTRS } from './common/map'
import { buildOrder, dateRange, pageToLimitOffset, SortMap } from './common/query-utils'
import { TxOpts } from './common/tx'
import { EquipmentFilter, IEquipmentRepo, ListQuery, ListResult, ReadOpts } from './types'

// Constants

const SORT_MAP: SortMap = {
	name: 'name',
	type: 'type',
	status: 'status',
	serialNumber: 'serialNumber',
	installedAt: 'installedAt',
	createdAt: 'createdAt',
	updatedAt: 'updatedAt',
};

const withPassport: Includeable = { model: EquipmentPassport, as: 'passport', attributes: [...PASSPORT_ATTRS], required: false };

// Functions

const lockOf = (opts?: ReadOpts) => {
	if (!opts?.tx || !opts.lock) return undefined;
	return opts.lock === 'update' ? Transaction.LOCK.UPDATE : Transaction.LOCK.SHARE;
};

async function findMany(q: ListQuery<EquipmentFilter>, opts?: TxOpts): Promise<ListResult<IEquipment>> {
	const { filter: f, sort, page, limit } = q;
	const installedAt = dateRange(f.installedFrom, f.installedTo);
	const cond: WhereOptions = {
		...(f.status ? { status: f.status } : {}),
		...(f.type ? { type: f.type } : {}),
		...(installedAt ? { installedAt } : {}),
	};
	const { rows, count } = await Equipment.findAndCountAll({
		where: cond,
		order: buildOrder(sort, SORT_MAP),
		...pageToLimitOffset(page, limit),
		include: [withPassport],
		distinct: true,
		transaction: opts?.tx,
	});
	return { items: rows.map(map2IEquipment), total: count };
}

async function findById(id: string, opts?: ReadOpts): Promise<IEquipment | null> {
	const lock = lockOf(opts);
	// FOR UPDATE нельзя применять к nullable-стороне OUTER JOIN, поэтому при блокировке паспорт не подгружаем
	const e = await Equipment.findByPk(id, {
		include: lock ? [] : [withPassport],
		transaction: opts?.tx,
		lock,
	});
	return e ? map2IEquipment(e) : null;
}

async function findBySerialNumber(serial: string, opts?: TxOpts): Promise<IEquipment | null> {
	const e = await Equipment.findOne({
		where: where(fn('lower', col('serial_number')), serial.trim().toLowerCase()),
		transaction: opts?.tx,
	});
	return e ? map2IEquipment(e) : null;
}

async function create(dto: EquipmentCreateDto, opts?: TxOpts): Promise<IEquipment> {
	const created = await Equipment.create({
		name: dto.name,
		type: dto.type,
		serialNumber: dto.serialNumber.trim(),
		siteId: dto.siteId ?? null,
		lat: dto.location.lat,
		lon: dto.location.lon,
		...(dto.status ? { status: dto.status } : {}),
		...(dto.installedAt ? { installedAt: dto.installedAt } : {}),
	}, { transaction: opts?.tx });
	return map2IEquipment(created);
}

async function update(id: string, patch: IEquipmentPatchDto, opts?: TxOpts): Promise<IEquipment | null> {
	const current = await Equipment.findByPk(id, { transaction: opts?.tx });
	if (!current) return null;
	const { location, ...rest } = patch;
	await current.update({
		...rest,
		...(rest.serialNumber ? { serialNumber: rest.serialNumber.trim() } : {}),
		...(location?.lat !== undefined ? { lat: location.lat } : {}), // слияние location, как в Кейсе 2
		...(location?.lon !== undefined ? { lon: location.lon } : {}),
	}, { transaction: opts?.tx });
	return findById(id, opts);
}

/** soft delete */
async function delete_(id: string, opts?: TxOpts): Promise<boolean> {
	const affected = await Equipment.destroy({ where: { id }, transaction: opts?.tx });
	return affected > 0;
}

/**
 * @testOnly
 */
async function deleteAllEquipments(): Promise<void> {
	await Equipment.destroy({ where: {}, force: true });
}

/**
 * @testOnly
 */
async function insertMultiple(equipments: IEquipment[] | readonly IEquipment[]): Promise<void> {
	await Equipment.bulkCreate(equipments.map((e) => ({
		id: e.id,
		siteId: e.siteId,
		name: e.name,
		type: e.type,
		serialNumber: e.serialNumber,
		status: e.status,
		lat: e.location.lat,
		lon: e.location.lon,
		installedAt: e.installedAt,
		createdAt: e.createdAt,
		updatedAt: e.updatedAt,
	})));
}

const EquipmentRepo: IEquipmentRepo = {
	findMany,
	findById,
	findBySerialNumber,
	create,
	update,
	delete: delete_,
};

export default {
	...EquipmentRepo,
	deleteAllEquipments,
	insertMultiple,
} as const;
