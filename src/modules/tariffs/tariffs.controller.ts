import {
    Controller,
    Get,
    Inject,
    LoggerService,
    HttpException,
    HttpStatus,
    UseInterceptors,
    Param,
    ParseIntPipe,
    Query,
    Body,
    Post,
    Put,
    Delete,
} from "@nestjs/common";
import { TariffService } from "./tariffs.service";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { LoggingInterceptor } from "../../common/interceptors/LogginInterceptor";
import { CreateTariffDto } from "./dto/create-tariff.dto";
import { UpdateTariffDto } from "./dto/update-tariff.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";

@ApiTags("Tariffs") // Swagger будет группировать все методы этого контроллера под тегом "Tariffs"
@Controller("/tariff")
@UseInterceptors(LoggingInterceptor)
export class TariffController {
    constructor(
        private readonly tariffService: TariffService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    @ApiOperation({ summary: "Получить все тарифы" })
    @ApiResponse({ status: 200, description: "Возвращает список всех тарифов" })
    @Get("/")
    getAllTariffs() {
        try {
            return this.tariffService.getAllTariffs();
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при получении тарифов", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Получить ежедневные тарифы" })
    @ApiResponse({ status: 200, description: "Возвращает список всех ежедневных данных тарифов" })
    @Get("/daily_data")
    getAllDailyData() {
        try {
            return this.tariffService.getDailyDataTariffs();
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при получении тарифов", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Получить тариф по ID" })
    @ApiParam({ name: "id", type: "number", description: "ID тарифа" })
    @ApiResponse({ status: 200, description: "Возвращает тариф по ID" })
    @ApiResponse({ status: 404, description: "Тариф не найден" })
    @Get("/:id")
    getTariffById(@Param("id", ParseIntPipe) id: number) {
        try {
            return this.tariffService.getTariffById(id);
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при получении тарифа", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Получить тариф по названию склада" })
    @ApiQuery({ name: "name", type: "string", description: "Название склада" })
    @ApiResponse({ status: 200, description: "Возвращает тариф для указанного склада" })
    @Get("/warehouse")
    getTariffByWarehouseName(@Query("name") warehouseName: string) {
        try {
            return this.tariffService.getTariffByWarehouseName(warehouseName);
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при получении тарифа", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Создать новый тариф" })
    @ApiResponse({ status: 201, description: "Тариф успешно создан" })
    @Post("/")
    createTariff(@Body() dto: CreateTariffDto) {
        try {
            return this.tariffService.createTariff(dto);
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при создании тарифа", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Обновить тариф по названию склада" })
    @ApiQuery({ name: "name", type: "string", description: "Название склада" })
    @ApiResponse({ status: 200, description: "Тариф успешно обновлен" })
    @ApiResponse({ status: 404, description: "Склад не найден" })
    @Put("/")
    updateTariffByWarehouseName(@Body() dto: UpdateTariffDto, @Query("name") warehouseName: string) {
        try {
            return this.tariffService.updateTariffByWarehouseName(dto, warehouseName);
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при обновлении тарифа", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Обновить тариф по ID" })
    @ApiParam({ name: "id", type: "number", description: "ID тарифа" })
    @ApiResponse({ status: 200, description: "Тариф успешно обновлен" })
    @ApiResponse({ status: 404, description: "Тариф не найден" })
    @Put("/:id")
    updateTariffById(@Body() dto: UpdateTariffDto, @Param("id", ParseIntPipe) id: number) {
        try {
            return this.tariffService.updateTariffById(dto, id);
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при обновлении тарифа", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Удалить тариф по названию склада" })
    @ApiQuery({ name: "name", type: "string", description: "Название склада" })
    @ApiResponse({ status: 200, description: "Тариф успешно удален" })
    @Delete("/")
    deleteTariffByWarehouseName(@Query("name") warehouseName: string) {
        try {
            return this.tariffService.deleteTariffByWarehouseName(warehouseName);
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при удалении тарифа", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Удалить тариф по ID" })
    @ApiParam({ name: "id", type: "number", description: "ID тарифа" })
    @ApiResponse({ status: 200, description: "Тариф успешно удален" })
    @ApiResponse({ status: 404, description: "Тариф не найден" })
    @Delete("/:id")
    deleteTariffById(@Param("id", ParseIntPipe) id: number) {
        try {
            return this.tariffService.deleteTariffById(id);
        } catch (e) {
            this.logger.error(`Error in tariffController:\n${e}`);
            throw new HttpException("Ошибка при удалении тарифа", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
