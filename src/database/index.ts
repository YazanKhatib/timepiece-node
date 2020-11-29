import { Model } from 'objection';
import { Logger } from '../services';
import Knex from 'knex';

const DATABASE_URL = 'postgres://postgres:admin@localhost:5432/chrono';

const connection = Knex({
  client: 'postgresql',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: 'src/database/migrations',
  },
  searchPath: ['knex', 'public'],
});

export const initializeDB = async () => {
  try {
    await Model.knex(connection);
    connection.migrate.latest().catch((e) => Logger.error(e.message));
    Logger.info('Database connection established!');
  } catch (e) {
    Logger.error(e.message);
  }
};
