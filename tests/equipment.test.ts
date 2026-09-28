import { beforeEach, describe, expect, it } from 'vitest';

import { agent } from './support/agent';
import { IDS, seed } from './support/fixtures';

const validEquipment = {
  name: 'New Turbine',
  type: 'turbine',
  serialNumber: 'NEW-TRB-01',
  location: { lat: 55.75, lon: 37.62 },
  installedAt: '2024-05-01',
};

beforeEach(seed);

describe('POST /api/equipment', () => {
  it('201 + Location + тело { data }, служебные поля из запроса игнорируются', async () => {
    const res = await agent.post('/api/equipment').send({ ...validEquipment, id: 'hacked', extra: 1 });
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(/^\/api\/equipment\/[0-9a-f-]{36}$/);
    expect(res.body.data).toMatchObject({ ...validEquipment, status: 'operational', installedAt: '2024-05-01T00:00:00.000Z' });
    expect(res.body.data.id).not.toBe('hacked');
    expect(res.body.data).not.toHaveProperty('extra');
  });

  it('422 с перечнем полей и причин', async () => {
    const res = await agent.post('/api/equipment').send({ name: 'ab', type: 'boiler', location: { lat: 200, lon: 0 } });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'type', 'serialNumber', 'location.lat']));
    expect(res.body.error.requestId).toBeTruthy();
  });

  it('422 для даты установки в будущем', async () => {
    const res = await agent.post('/api/equipment').send({ ...validEquipment, installedAt: '2999-01-01' });
    expect(res.status).toBe(422);
    expect(res.body.error.details[0].field).toBe('installedAt');
  });

  it('409 при повторном serialNumber без учёта регистра', async () => {
    const res = await agent.post('/api/equipment').send({ ...validEquipment, serialNumber: ' test-trb-x1 ' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SERIAL_NUMBER_TAKEN');
  });
});

describe('GET /api/equipment', () => {
  it('список с meta и значениями по умолчанию', async () => {
    const res = await agent.get('/api/equipment');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.meta).toEqual({ total: 3, page: 1, limit: 20 });
  });

  it('фильтр по типу и статусу', async () => {
    const res = await agent.get('/api/equipment?type=inverter&status=fault');
    expect(res.body.data.map((e: { id: string }) => e.id)).toEqual([IDS.inverter]);
  });

  it('фильтр по диапазону дат установки', async () => {
    const res = await agent.get('/api/equipment?installedFrom=2023-07-01&installedTo=2023-12-31');
    expect(res.body.data.map((e: { id: string }) => e.id)).toEqual([IDS.inverter]);
  });

  it('сортировка по убыванию и пагинация', async () => {
    const res = await agent.get('/api/equipment?sort=-installedAt&page=2&limit=1');
    expect(res.body.data.map((e: { id: string }) => e.id)).toEqual([IDS.inverter]);
    expect(res.body.meta).toEqual({ total: 3, page: 2, limit: 1 });
  });

  it.each([
    ['limit=1000', 'limit'],
    ['page=0', 'page'],
    ['sort=unknown', 'sort'],
    ['status=broken', 'status'],
  ])('400 для неверного query %s', async (qs, field) => {
    const res = await agent.get(`/api/equipment?${qs}`);
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe(field);
  });
});

describe('GET/PATCH/DELETE /api/equipment/:id', () => {
  it('200 карточка', async () => {
    const res = await agent.get(`/api/equipment/${IDS.turbine}`);
    expect(res.status).toBe(200);
    expect(res.body.data.serialNumber).toBe('TEST-TRB-X1');
  });

  it('400 для id не в формате UUID', async () => {
    const res = await agent.get('/api/equipment/not-a-uuid');
    expect(res.status).toBe(400);
  });

  it('404 для несуществующего id', async () => {
    const res = await agent.get(`/api/equipment/${IDS.missing}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('EQUIPMENT_NOT_FOUND');
  });

  it('PATCH частично обновляет, в том числе вложенный location', async () => {
    const res = await agent.patch(`/api/equipment/${IDS.turbine}`).send({ name: 'Renamed turbine', location: { lat: 1 } });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Renamed turbine', location: { lat: 1, lon: 20 }, serialNumber: 'TEST-TRB-X1' });
  });

  it('PATCH: 409 при занятом чужом serialNumber, свой номер можно повторить', async () => {
    const taken = await agent.patch(`/api/equipment/${IDS.turbine}`).send({ serialNumber: 'TEST-INV-X2' });
    expect(taken.status).toBe(409);
    const own = await agent.patch(`/api/equipment/${IDS.turbine}`).send({ serialNumber: 'TEST-TRB-X1' });
    expect(own.status).toBe(200);
  });

  it('DELETE: 409 при открытых заявках', async () => {
    const res = await agent.delete(`/api/equipment/${IDS.turbine}`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EQUIPMENT_HAS_OPEN_REQUESTS');
  });

  it('DELETE: 204, если открытых заявок нет (done не мешает)', async () => {
    const res = await agent.delete(`/api/equipment/${IDS.sensor}`);
    expect(res.status).toBe(204);
    expect((await agent.get(`/api/equipment/${IDS.sensor}`)).status).toBe(404);
  });
});

describe('GET /api/equipment/:id/requests', () => {
  it('заявки только этого оборудования, equipmentId из query не перебивает путь', async () => {
    const res = await agent.get(`/api/equipment/${IDS.turbine}/requests?equipmentId=${IDS.inverter}`);
    expect(res.status).toBe(200);
    expect(res.body.data.map((r: { id: string }) => r.id)).toEqual([IDS.reqNew]);
    expect(res.body.meta.total).toBe(1);
  });

  it('404 для несуществующего оборудования', async () => {
    const res = await agent.get(`/api/equipment/${IDS.missing}/requests`);
    expect(res.status).toBe(404);
  });
});
