import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('offers', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.integer('watch_id').notNullable();
    table.integer('proposed_price').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('offers');
}
