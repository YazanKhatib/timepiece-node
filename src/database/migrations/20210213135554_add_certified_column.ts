import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('watches', (table) => {
    table.boolean('certified').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('watches', (table) => {
    table.dropColumn('certified');
  });
}
