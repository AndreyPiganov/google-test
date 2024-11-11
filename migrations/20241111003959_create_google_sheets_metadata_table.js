/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function (knex) {
    return knex.schema.createTable("google_sheets_metadata", function (table) {
        table.increments("id").primary(); // ID
        table.string("spreadsheet_id").notNullable(); // Идентификатор таблицы
        table.boolean("is_filled").defaultTo(false); // Флаг, указывающий, заполнена ли таблица
        table.timestamp("created_at").defaultTo(knex.fn.now()); // Дата создания
    });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("google_sheets_metadata"); // Откат миграции
};
