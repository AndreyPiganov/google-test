import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { DatabaseService } from "../database/database.service";
import { CreateTariffDto } from "./dto/create-tariff.dto";
import { UpdateTariffDto } from "./dto/update-tariff.dto";
import { Tariff } from "src/common/interfaces/tariff";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios from "axios";
import getCurrentDate from "src/utils/getCurrentData";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TariffType } from "./dto/tariff";

/** Сервис для управления тарифами. Включает методы для создания, обновления, получения и удаления тарифов. */
@ApiTags("Tariffs")
@Injectable()
export class TariffService {
    constructor(
        private readonly db: DatabaseService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    @ApiOperation({ summary: "Периодически обновляет тарифы" })
    @ApiResponse({ status: 200, description: "Тарифы успешно обновлены" })
    async handleCron(): Promise<void> {
        this.logger.log("Starting hourly API request for tariffs");

        try {
            const currentDate = getCurrentDate();
            const { data }: any = await axios.get(`https://common-api.wildberries.ru/api/v1/tariffs/box?date=${currentDate}`, {
                headers: {
                    "Authorization": `Bearer ${process.env.API_KEY}`,
                },
            });
            const tariffs: Tariff[] = data.response.data.warehouseList;

            for (const tariff of tariffs) {
                const existingTariff = await this.getTariffByWarehouseName(tariff.warehouseName);

                if (existingTariff) {
                    const isUpdated = this.isTariffUpdated(existingTariff, tariff);

                    if (isUpdated) {
                        await this.updateTariffByWarehouseName(
                            { ...tariff, boxDeliveryAndStorageExpr: parseInt(tariff.boxDeliveryAndStorageExpr, 10) },
                            tariff.warehouseName,
                        );
                        this.logger.log(`Tariff for ${tariff.warehouseName} updated`);

                        await this.db.insertData("daily_data", {
                            tariff_id: existingTariff.id,
                            date: currentDate,
                            boxDeliveryAndStorageExpr: tariff.boxDeliveryAndStorageExpr,
                            boxDeliveryBase: tariff.boxDeliveryBase,
                            boxStorageBase: tariff.boxStorageBase,
                            boxDeliveryLiter: tariff.boxDeliveryLiter,
                            boxStorageLiter: tariff.boxStorageLiter,
                        });
                        this.logger.log(`Daily data for ${tariff.warehouseName} saved`);
                    }
                } else {
                    const newTariff = await this.createTariff({ ...tariff, boxDeliveryAndStorageExpr: parseInt(tariff.boxDeliveryAndStorageExpr, 10) });
                    this.logger.log(`New tariff for ${tariff.warehouseName} added`);

                    await this.db.insertData("daily_data", {
                        tariff_id: newTariff.id,
                        boxDeliveryAndStorageExpr: tariff.boxDeliveryAndStorageExpr,
                        boxDeliveryBase: tariff.boxDeliveryBase,
                        boxStorageBase: tariff.boxStorageBase,
                        boxDeliveryLiter: tariff.boxDeliveryLiter,
                        boxStorageLiter: tariff.boxStorageLiter,
                    });
                    this.logger.log(`Daily data for ${tariff.warehouseName} saved`);
                }
            }

            this.logger.log("API request and data update completed successfully");
        } catch (e) {
            this.logger.error("Error during hourly API request", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Получить все тарифы" })
    @ApiResponse({ status: 200, description: "Все тарифы успешно получены", type: [TariffType] })
    async getAllTariffs(): Promise<Tariff[]> {
        this.logger.log("Fetching all tariffs");
        try {
            const tariffs = await this.db.getAll("tariffs");
            this.logger.log("Fetched all tariffs");
            return tariffs;
        } catch (e) {
            this.logger.error("Error fetching all tariffs", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Получить тариф по ID" })
    @ApiResponse({ status: 200, description: "Тариф успешно найден", type: TariffType })
    async getTariffById(id: number): Promise<Tariff> {
        try {
            const tariff = await this.db.getOneById("tariffs", id);
            this.logger.log("Fetched tariff by id");
            return tariff;
        } catch (e) {
            this.logger.error("Error fetching tariff by id", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Получить тариф по названию склада" })
    @ApiResponse({ status: 200, description: "Тариф найден", type: TariffType })
    @ApiResponse({ status: 404, description: "Тариф не найден" })
    async getTariffByWarehouseName(name: string): Promise<Tariff | null> {
        try {
            const tariff = await this.db.knex.table("tariffs").where("warehouseName", name).first();
            if (!tariff) {
                this.logger.warn(`Запись с warehouseName ${name} не найдена в таблице tariffs`);
                return null;
            }
            return tariff;
        } catch (e) {
            this.logger.error("Error fetch tariff by warehouseName", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Создать новый тариф" })
    @ApiResponse({ status: 201, description: "Новый тариф успешно создан", type: TariffType })
    async createTariff(dto: CreateTariffDto): Promise<Tariff> {
        try {
            const tariff = await this.db.insertData("tariffs", dto);
            this.logger.log("Create Tariff successful");
            return tariff;
        } catch (e) {
            this.logger.error("Error creating tariff", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Обновить тариф по ID" })
    @ApiResponse({ status: 200, description: "Тариф успешно обновлен", type: TariffType })
    async updateTariffById(dto: UpdateTariffDto, id: number): Promise<Tariff> {
        try {
            const tariff = await this.db.updateById("tariffs", id, dto);
            this.logger.log("Update Tariff successful");
            return tariff;
        } catch (e) {
            this.logger.error("Error updating tariff by id", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Обновить тариф по названию склада" })
    @ApiResponse({ status: 200, description: "Тариф успешно обновлен", type: [TariffType] })
    @ApiResponse({ status: 404, description: "Тариф не найден" })
    async updateTariffByWarehouseName(dto: UpdateTariffDto, name: string): Promise<Tariff[] | null> {
        try {
            const tariff = await this.db.knex.table("tariffs").where("warehouseName", name).update(dto).returning("*");
            if (!tariff) {
                this.logger.warn(`Запись с warehouseName ${name} не найдена в таблице tariffs`);
                return null;
            }
            this.logger.log("Update tariff by warehouseName successful");
            return tariff;
        } catch (e) {
            this.logger.error("Error updating tariff by warehouseName", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Удалить тариф по названию склада" })
    @ApiResponse({ status: 200, description: "Тариф успешно удален" })
    async deleteTariffByWarehouseName(name: string): Promise<number> {
        try {
            const deletedRows = await this.db.knex("tariffs").where("warehouseName", name).del();
            if (deletedRows === 0) {
                this.logger.warn(`Запись с warehouseName ${name} не найдена для удаления в таблице tariffs`);
                return null;
            }
            this.logger.log("Delete tariff by warehouseName successful");
            return deletedRows;
        } catch (e) {
            this.logger.error("Error deleting tariff by warehouseName", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Удалить тариф по ID" })
    @ApiResponse({ status: 200, description: "Тариф успешно удален" })
    async deleteTariffById(id: number): Promise<number> {
        try {
            const tariff = await this.db.deleteById("tariffs", id);
            this.logger.log("Delete tariff by id successful");
            return tariff;
        } catch (e) {
            this.logger.error("Error deleting tariff by id", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Получение daily_data" })
    @ApiResponse({ status: 200, description: "Daily_data успешно получена" })
    async getDailyDataTariffs() {
        try {
            const daily_data = await this.db.getAll("daily_data");
            this.logger.log("Fetched all daily_data");
            return daily_data;
        } catch (e) {
            this.logger.error("Error get daily_data", e);
            throw e;
        }
    }

    private isTariffUpdated(existingTariff: Tariff, newTariff: Tariff): boolean {
        const fieldsToCheck = ["boxDeliveryBase", "boxStorageBase", "boxDeliveryLiter", "boxStorageLiter"];
        return fieldsToCheck.some((field) => existingTariff[field] !== newTariff[field]);
    }
}
