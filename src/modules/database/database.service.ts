import { Injectable, OnModuleInit, OnModuleDestroy, Inject, LoggerService } from "@nestjs/common";
import { INestApplication } from "@nestjs/common";
import Knex, { Knex as KnexType } from "knex"; // Импорт типа Knex
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    readonly knex: KnexType;
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService;

    constructor() {
        this.knex = Knex({
            client: "pg",
            connection: process.env.DATABASE_URL,
        });
    }

    async onModuleInit() {
        try {
            await this.knex.raw("SELECT 1");
            this.logger.log("Соединение с базой данных установлено");
        } catch (error) {
            this.logger.error("Не удалось подключиться к базе данных:", error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.knex.destroy();
            this.logger.log("Соединение с базой данных закрыто");
        } catch (error) {
            this.logger.error("Ошибка при закрытии соединения с базой данных:", error);
            throw error;
        }
    }

    async enableShutdownHooks(app: INestApplication) {
        this.knex.client.on("beforeExit", async () => {
            await app.close();
            this.logger.log("Приложение закрыто");
        });
    }

    async getAll(table: string, orderBy: string = "id") {
        try {
            return await this.knex(table).orderBy(orderBy).returning("*");
        } catch (error) {
            this.logger.error(`Ошибка при получение данных из таблицы ${table}`, error);
            throw error;
        }
    }

    async getOneById(table: string, id: number) {
        try {
            const tariff = await this.knex(table).where("id", id).first();
            if (!tariff) {
                this.logger.warn(`Запись с id ${id} не найдена в таблице ${table}`);
                return null;
            }
            this.logger.log(`Данные успешно найдены для таблицы ${table} по id ${id}`);
            return tariff;
        } catch (error) {
            this.logger.error(`Ошибка при получении данных из таблицы ${table} по id ${id}`, error);
            throw error;
        }
    }

    async insertData(table: string, data: any) {
        try {
            const [newRecord] = await this.knex(table).insert(data).returning("*");
            this.logger.log(`Данные успешно созданы для таблицы ${table}`);
            return newRecord;
        } catch (error) {
            this.logger.error(`Ошибка при вставке данных в таблицу ${table}`, error);
            throw error;
        }
    }

    async updateById(table: string, id: number, data: any) {
        try {
            const [updatedRecord] = await this.knex(table).where("id", id).update(data).returning("*");
            if (!updatedRecord) {
                this.logger.warn(`Запись с id ${id} не найдена для обновления в таблице ${table}`);
                return null;
            }
            this.logger.log(`Данные успешно обновлены для таблицы ${table} по id ${id}`);
            return updatedRecord;
        } catch (error) {
            this.logger.error(`Ошибка при обновлении данных в таблице ${table} по id ${id}`, error);
            throw error;
        }
    }

    async deleteById(table: string, id: number) {
        try {
            const deletedRows = await this.knex(table).where("id", id).del();
            if (deletedRows === 0) {
                this.logger.warn(`Запись с id ${id} не найдена для удаления в таблице ${table}`);
                return null;
            }
            this.logger.log(`Данные успешно удалены для таблицы ${table} по id - ${id}`);
            return deletedRows;
        } catch (error) {
            this.logger.error(`Ошибка при удалении данных из таблицы ${table} по id ${id}`, error);
            throw error;
        }
    }
}
