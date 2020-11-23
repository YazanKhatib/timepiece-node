const DATABASE_URL = 'postgres://postgres:admin@localhost:5432/chrono';

export default {
  development: {
    client: 'postgresql',
    connection: DATABASE_URL,
    migrations: {
      directory: './database/migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/migrations',
    },
  },
};
