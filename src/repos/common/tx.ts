import sequelize from '@src/db/sequelize'
import { Transaction } from 'sequelize'

export type Tx = Transaction;

export interface TxOpts {
	tx?: Tx;
}

export function runInTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
	return sequelize.transaction((tx) => fn(tx));
}
