import { beforeEach, describe, expect, it } from 'vitest'

import { sequelize } from '@src/db/models'

import { agent } from './support/agent'
import { IDS, seed } from './support/fixtures'

beforeEach(seed);

const range = 'from=2026-01-01&to=2027-01-01';

describe('GET /api/sites/:id/summary', () => {
  it('счётчики по статусам и приоритетам, среднее время закрытия', async () => {
    // заявка на оборудовании площадки: turbine (reqNew) -> + одна in_progress
    const res = await agent.get(`/api/sites/${IDS.site}/summary`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      siteId: IDS.site,
      byStatus: [{ status: 'new', count: 1 }],
      byPriority: [{ priority: 'low', count: 1 }],
      avgCloseHours: null,
    });
  });

  it('404 для неизвестной площадки, 400 для не-UUID', async () => {
    expect((await agent.get(`/api/sites/${IDS.missing}/summary`)).status).toBe(404);
    expect((await agent.get('/api/sites/nope/summary')).status).toBe(400);
  });
});

describe('GET /api/reports/equipment-load', () => {
  it('агрегаты по оборудованию: заявки, закрытые, плановые часы, последнее обслуживание', async () => {
    const res = await agent.get(`/api/reports/equipment-load?${range}&sort=-requestsTotal`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ total: 3, limit: 20, offset: 0 });
    const rows = res.body.data as { id: string }[];
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(byId[IDS.sensor]).toMatchObject({ requestsTotal: 1, requestsClosed: 1, plannedHoursTotal: 3, lastServiceAt: '2026-01-16T00:00:00.000Z', siteCode: null });
    expect(byId[IDS.inverter]).toMatchObject({ requestsTotal: 1, requestsClosed: 0, plannedHoursTotal: 6 });
    expect(byId[IDS.turbine]).toMatchObject({ requestsTotal: 1, plannedHoursTotal: 0, siteCode: 'TST-01' });
  });

  it('JOIN не размножает строки: несколько исполнителей не раздувают счётчик заявок', async () => {
    const res = await agent.get(`/api/reports/equipment-load?${range}`);
    const inverter = res.body.data.find((r: { id: string }) => r.id === IDS.inverter);
    expect(inverter.requestsTotal).toBe(1); // у заявки 2 исполнителя
  });

  it('minRequests отсекает оборудование с меньшим числом заявок', async () => {
    const res = await agent.get(`/api/reports/equipment-load?${range}&minRequests=2`);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('период ограничивает заявки по created_at', async () => {
    const res = await agent.get('/api/reports/equipment-load?from=2026-03-01&to=2026-03-31&minRequests=1');
    expect(res.body.data.map((r: { id: string }) => r.id).sort()).toEqual([IDS.inverter, IDS.turbine].sort());
  });

  it('пагинация', async () => {
    const res = await agent.get(`/api/reports/equipment-load?${range}&sort=name&limit=1&offset=1`);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Test Sensor X3');
    expect(res.body.meta).toMatchObject({ total: 3, limit: 1, offset: 1 });
  });

  it('удалённое оборудование в отчёт не попадает', async () => {
    await agent.delete(`/api/equipment/${IDS.sensor}`);
    const res = await agent.get(`/api/reports/equipment-load?${range}`);
    expect(res.body.meta.total).toBe(2);
  });

  it.each([
    ['инъекция в sort', `${range}&sort=name;DROP TABLE equipment`],
    ['limit больше 100', `${range}&limit=1000`],
    ['offset больше 100000', `${range}&offset=100001`],
    ['нет from', 'to=2027-01-01'],
    ['from не дата', 'from=yesterday&to=2027-01-01'],
    ['minRequests отрицательный', `${range}&minRequests=-1`],
    ['from позже to', 'from=2027-01-01&to=2026-01-01'],
  ])('400: %s', async (_, query) => {
    const res = await agent.get(`/api/reports/equipment-load?${query}`);
    expect(res.status).toBe(400);
    const tables = await sequelize.query("SELECT to_regclass('public.equipment') AS t");
    expect(JSON.stringify(tables[0])).toContain('equipment');
  });
});
