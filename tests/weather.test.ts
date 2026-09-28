import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { agent } from './support/agent';
import { IDS, seed } from './support/fixtures';

// Пороги из config/.env.test: ветер 10 м/с, осадки 0.5 мм
const openMeteo = {
  daily: {
    time: ['2026-10-01', '2026-10-02', '2026-10-03'],
    temperature_2m_max: [12, 10, 14],
    temperature_2m_min: [5, 4, 6],
    precipitation_sum: [3.2, 0, 0.1],
    wind_speed_10m_max: [12.5, 4, 6],
  },
};

beforeEach(seed);
afterEach(() => vi.restoreAllMocks());

describe('GET /api/equipment/:id/weather', () => {
  it('прогноз по координатам оборудования и оценка пригодности', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(openMeteo)));
    const res = await agent.get(`/api/equipment/${IDS.turbine}/weather`);

    expect(res.status).toBe(200);
    const url = new URL(fetchSpy.mock.calls[0][0] as URL);
    expect(url.searchParams.get('latitude')).toBe('10');
    expect(url.searchParams.get('longitude')).toBe('20');

    const { data } = res.body;
    expect(data.equipmentId).toBe(IDS.turbine);
    expect(data.forecast[0]).toMatchObject({ date: '2026-10-01', suitable: false });
    expect(data.forecast[0].reasons).toHaveLength(2);
    expect(data.forecast[1]).toMatchObject({ suitable: true, reasons: [] });
    expect(data.suitableForOutdoorWork).toBe(true);
    expect(data.nextSuitableDate).toBe('2026-10-02');
  });

  it('502, если внешний API недоступен', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'));
    const res = await agent.get(`/api/equipment/${IDS.turbine}/weather`);
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('WEATHER_UNAVAILABLE');
  });

  it('502, если API ответил ошибкой или неожиданным форматом', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('oops', { status: 500 }));
    expect((await agent.get(`/api/equipment/${IDS.turbine}/weather`)).status).toBe(502);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ hourly: {} })));
    expect((await agent.get(`/api/equipment/${IDS.turbine}/weather`)).status).toBe(502);
  });

  it('504 при таймауте', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const res = await agent.get(`/api/equipment/${IDS.turbine}/weather`);
    expect(res.status).toBe(504);
    expect(res.body.error.code).toBe('WEATHER_TIMEOUT');
  });

  it('404 для несуществующего оборудования, внешний API не вызывается', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await agent.get(`/api/equipment/${IDS.missing}/weather`);
    expect(res.status).toBe(404);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
