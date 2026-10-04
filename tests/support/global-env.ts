import path from 'path'
import { config } from 'dotenv'

// globalSetup выполняется в основном процессе, где setupFiles ещё не отработали: подгружаем те же файлы окружения.
export default function setup() {
	config({ path: path.resolve(__dirname, '../../config/.env.test.local'), quiet: true });
	config({ path: path.resolve(__dirname, '../../config/.env.test'), quiet: true });
}
