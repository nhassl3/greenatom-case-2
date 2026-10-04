import { execSync } from 'child_process'
import { assertTestDb } from './guard'

// Один раз за прогон: проверка, что БД тестовая, и применение миграций (идемпотентно).
export default function setup() {
	assertTestDb();
	execSync('npx sequelize-cli db:migrate', {
		stdio: 'inherit',
		env: { ...process.env, NODE_ENV: 'test' },
	});
}
