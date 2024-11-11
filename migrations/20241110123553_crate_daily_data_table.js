/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */

exports.up = function (knex) {
    return knex.schema.createTable("daily_data", function (table) {
        table.increments("id").primary();
        table.integer("tariff_id").unsigned().references("id").inTable("tariffs");
        table.string("warehouseName");
        table.timestamp("created_at").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table.integer("boxDeliveryAndStorageExpr", 10, 2).notNullable();
        table.string("boxDeliveryBase", 10, 2).notNullable();
        table.string("boxDeliveryLiter", 10, 2).notNullable();
        table.string("boxStorageBase", 10, 2).nullable();
        table.string("boxStorageLiter", 10, 2).nullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */

exports.down = function (knex) {
    return knex.schema.dropTable("daily_data");
};
