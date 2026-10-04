/** TRUNCATE перед каждым тестом: работаем только с базой, имя которой заканчивается на _test. */
export function assertTestDb(): void {
	const name = process.env.DB_NAME ?? '';
	if (!name.endsWith('_test')) {
		throw new Error(`Тесты чистят таблицы, DB_NAME="${name}" не оканчивается на "_test". Задайте тестовую БД в config/.env.test.local`);
	}
}
