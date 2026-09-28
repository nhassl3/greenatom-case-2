# Кейс 2 — REST API для оборудования и заявок

Express + TypeScript, данные лежат в json файле. Погода берется с Open-Meteo (модуль из первого кейса).

Нужен Node 20+.

## Запуск

```bash
cp config/.env.example config/.env.development
npm ci
npm run dev:watch
```

По умолчанию поднимается на `http://localhost:3000`, проверить можно через `/api/health`.

Прод:

```bash
cp config/.env.example config/.env.production
npm run build
npm start
```

Все переменные есть в `config/.env.example`, если чего-то не хватает приложение не стартанет.

## Тесты

```bash
npm test
```

Берется конфиг `config/.env.test`.

## Docker

```bash
cp config/.env.example config/.env.production   # NODE_ENV=production и API_KEY
docker compose up --build -d
```

Порт 3000, база сохраняется в volume `api-data`.

## Postman

Коллекция лежит в `docs/postman/`, импортировать в Postman и запускать. Перед этим нужно поднять сервер.
В коллекции есть переменная `baseUrl`, по умолчанию должна быть `http://localhost:3000/api`.
Если задан `API_KEY`, то на POST/PATCH/DELETE надо добавить заголовок `X-API-Key`, иначе будет 401.
