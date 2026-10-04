import path from 'path'
import { config } from 'dotenv'

// Локальные (не попадающие в git) параметры тестовой БД. dotenv не перезаписывает уже заданные переменные,
// поэтому значения из .env.test.local имеют приоритет над config/.env.test, а переменные окружения — над обоими.
config({ path: path.resolve(__dirname, '../../config/.env.test.local'), quiet: true });
