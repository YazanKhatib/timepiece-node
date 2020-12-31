import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.date('birth');
      table.string('gender');
      table.string('phone', 255);
      table.string('token', 255);
      table.string('address', 255);
      table.string('last_name', 255);
      table.string('first_name', 255);
      table.string('password', 255).notNullable();
      table.string('email', 255).unique().notNullable();
      table.integer('count').defaultTo(0);
      table.boolean('dealer').defaultTo(false);
      table.boolean('blocked').defaultTo(false);
      table.boolean('confirmed').defaultTo(false);
      table.boolean('isAdmin').defaultTo(false);
      table.string('username', 255).unique().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    .createTable('watches', (table) => {
      table.increments('id').primary();
      table.string('brand', 255).notNullable();
      table.string('model', 255).notNullable();
      table.string('description', 255);
      table.string('movement', 255);
      table.string('case_material', 255);
      table.string('bracelet_material', 255);
      table.integer('production_year');
      table.string('condition', 255);
      table.string('delivery');
      table.string('gender');
      table.string('location');
      table.boolean('featured').defaultTo(false);

      // Calibar
      table.string('calibar');
      table.integer('jewels');
      table.string('base_calibar');
      table.integer('power_reserve');

      // Case
      table.integer('case_diameter');
      table.integer('water_resistance');
      table.string('bezel_material');
      table.string('crystal');
      table.string('dial');
      table.string('dial_numbers');

      // Bracelet/strap
      table.string('bracelet_color');
      table.string('clasp');
      table.string('clasp_material');

      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    .createTable('users_watches', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable();
      table.integer('watch_id').notNullable();
    })

    .createTable('brands', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    .createTable('images', (table) => {
      table.increments('id').primary();
      table.string('url').notNullable();
      table.boolean('main').defaultTo(false);
      table.integer('watch_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('users')
    .dropTable('watches')
    .dropTable('users_watches')
    .dropTable('brands')
    .dropTableIfExists('images');
}
