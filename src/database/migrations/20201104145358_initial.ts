import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('phone', 255);
    table.string('token', 255);
    table.string('address', 255);
    table.string('last_name', 255);
    table.string('first_name', 255);
    table.string('password', 255).notNullable();
    table.string('email', 255).unique().notNullable();
    table.integer('count').defaultTo(0);
    table.boolean('confirmed').defaultTo(false);
    table.string('username', 255).unique().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
