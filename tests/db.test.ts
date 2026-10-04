import { beforeEach, describe, expect, it } from 'vitest'

import { RequestAssignee, RequestStatusHistory, sequelize } from '@src/db/models'

import { agent } from './support/agent'
import { IDS, seed } from './support/fixtures'

beforeEach(seed);

const newEquipment = (serialNumber: string) => ({
  name: 'Another turbine', type: 'turbine', serialNumber, location: { lat: 1, lon: 2 },
});

describe('ограничения БД', () => {
  it('журнал статусов append-only: UPDATE и DELETE запрещены триггером', async () => {
    const row = await RequestStatusHistory.findOne({ where: { requestId: IDS.reqNew } });
    await expect(sequelize.query('UPDATE request_status_history SET comment = \'x\' WHERE id = :id', { replacements: { id: row!.id } }))
      .rejects.toThrow(/append-only/);
    await expect(sequelize.query('DELETE FROM request_status_history WHERE id = :id', { replacements: { id: row!.id } }))
      .rejects.toThrow(/append-only/);
    await expect(row!.update({ comment: 'x' })).rejects.toThrow(/append-only/); // и хук модели
  });

  it('дубль (request_id, technician_id) нарушает PK', async () => {
    await expect(RequestAssignee.create({ requestId: IDS.reqInProgress, technicianId: IDS.techLead, role: 'member', plannedHours: 1 }))
      .rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' });
  });

  it('второй lead у заявки нарушает частичный уникальный индекс', async () => {
    await expect(RequestAssignee.create({ requestId: IDS.reqInProgress, technicianId: IDS.techFree, role: 'lead', plannedHours: 1 }))
      .rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' });
  });

  it('CHECK: planned_hours > 0 и координаты в диапазоне', async () => {
    await expect(sequelize.query('UPDATE request_assignees SET planned_hours = 0 WHERE request_id = :id', { replacements: { id: IDS.reqDone } }))
      .rejects.toThrow(/planned_hours_chk/);
    await expect(sequelize.query('UPDATE equipment SET lat = 91 WHERE id = :id', { replacements: { id: IDS.turbine } }))
      .rejects.toThrow(/equipment_lat_range_chk/);
  });
});

describe('мягкое удаление и серийный номер', () => {
  it('серийник уникален без учёта регистра среди неудалённых', async () => {
    const res = await agent.post('/api/equipment').send(newEquipment('test-trb-x1'));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SERIAL_NUMBER_TAKEN');
  });

  it('после удаления серийник можно использовать снова, удалённое оборудование не видно', async () => {
    expect((await agent.delete(`/api/equipment/${IDS.sensor}`)).status).toBe(204);
    expect((await agent.get(`/api/equipment/${IDS.sensor}`)).status).toBe(404);
    expect((await agent.post('/api/equipment').send(newEquipment('TEST-SNS-X3'))).status).toBe(201);
  });

  it('заявки и журнал удалённой заявки сохраняются в БД, но недоступны через API', async () => {
    expect((await agent.delete(`/api/requests/${IDS.reqDone}`)).status).toBe(204);
    expect((await agent.get(`/api/requests/${IDS.reqDone}`)).status).toBe(404);
    const [rows] = await sequelize.query('SELECT count(*)::int AS n FROM request_status_history WHERE request_id = :id', { replacements: { id: IDS.reqDone } });
    expect((rows[0] as { n: number }).n).toBe(3);
  });

  it('гонка за серийник: уникальный индекс возвращает 409, а не 500', async () => {
    const [a, b] = await Promise.all([
      agent.post('/api/equipment').send(newEquipment('RACE-0001')),
      agent.post('/api/equipment').send(newEquipment('RACE-0001')),
    ]);
    expect([a.status, b.status].sort()).toEqual([201, 409]);
  });
});

describe('оборудование: площадка и паспорт', () => {
  it('siteId необязателен, неизвестная площадка даёт 404, заданная возвращается в ответе', async () => {
    const noSite = await agent.post('/api/equipment').send(newEquipment('NOSITE-1'));
    expect(noSite.status).toBe(201);
    expect(noSite.body.data.siteId).toBeNull();

    const missing = await agent.post('/api/equipment').send({ ...newEquipment('NOSITE-2'), siteId: IDS.missing });
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('SITE_NOT_FOUND');

    const ok = await agent.post('/api/equipment').send({ ...newEquipment('SITE-3'), siteId: IDS.site });
    expect(ok.body.data.siteId).toBe(IDS.site);
  });

  it('удаление оборудования с открытой заявкой — 409', async () => {
    const res = await agent.delete(`/api/equipment/${IDS.inverter}`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EQUIPMENT_HAS_OPEN_REQUESTS');
  });

  it('карточка содержит passport (null, если паспорта нет)', async () => {
    const res = await agent.get(`/api/equipment/${IDS.turbine}`);
    expect(res.body.data).toHaveProperty('passport', null);
    await sequelize.query(
      "INSERT INTO equipment_passports (equipment_id, manufacturer, model, nominal_power, created_at, updated_at) VALUES (:id, 'ABB', 'M1', 12.5, now(), now())",
      { replacements: { id: IDS.turbine } },
    );
    const withPassport = await agent.get(`/api/equipment/${IDS.turbine}`);
    expect(withPassport.body.data.passport).toMatchObject({ manufacturer: 'ABB', model: 'M1', nominalPower: 12.5 });
    const list = await agent.get('/api/equipment');
    expect(list.body.meta.total).toBe(3);
  });
});
