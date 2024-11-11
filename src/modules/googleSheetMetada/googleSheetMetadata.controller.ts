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
    Body,
    Post,
    Put,
    Delete,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { LoggingInterceptor } from "../../common/interceptors/LogginInterceptor";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { GoogleSheetsMetadataService } from "./googleSheetMedata.service";
import { CreateGoogleSheetsMetadataDto } from "./dto/create-google-sheet-metadata.dto";
import { UpdateGoogleSheetsMetadataDto } from "./dto/update-google-sheet-metadata.dto";

@ApiTags("Google Sheets Metadata") // Swagger будет группировать все методы этого контроллера под тегом "Google Sheets Metadata"
@Controller("/google-sheets-metadata")
@UseInterceptors(LoggingInterceptor)
export class GoogleSheetsMetadataController {
    constructor(
        private readonly googleSheetsMetadataService: GoogleSheetsMetadataService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    @ApiOperation({ summary: "Получить все метаданные Google Sheets" })
    @ApiResponse({ status: 200, description: "Возвращает список всех метаданных" })
    @Get("/")
    async getAllGoogleSheetsMetadata() {
        try {
            return await this.googleSheetsMetadataService.getAllGoogleSheetsMetadata();
        } catch (e) {
            this.logger.error(`Error in GoogleSheetsMetadataController:\n${e}`);
            throw new HttpException("Ошибка при получении метаданных Google Sheets", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Получить метаданные Google Sheets по ID" })
    @ApiParam({ name: "id", type: "number", description: "ID метаданных" })
    @ApiResponse({ status: 200, description: "Возвращает метаданные по ID" })
    @ApiResponse({ status: 404, description: "Метаданные не найдены" })
    @Get("/:id")
    async getGoogleSheetsMetadataById(@Param("id", ParseIntPipe) id: number) {
        try {
            return await this.googleSheetsMetadataService.getGoogleSheetsMetadataById(id);
        } catch (e) {
            this.logger.error(`Error in GoogleSheetsMetadataController:\n${e}`);
            throw new HttpException("Ошибка при получении метаданных по ID", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Создать новые метаданные Google Sheets" })
    @ApiResponse({ status: 201, description: "Метаданные успешно созданы" })
    @Post("/")
    async createGoogleSheetsMetadata(@Body() dto: CreateGoogleSheetsMetadataDto) {
        try {
            return await this.googleSheetsMetadataService.createGoogleSheetsMetadata(dto);
        } catch (e) {
            this.logger.error(`Error in GoogleSheetsMetadataController:\n${e}`);
            throw new HttpException("Ошибка при создании метаданных Google Sheets", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Обновить метаданные Google Sheets по ID" })
    @ApiParam({ name: "id", type: "number", description: "ID метаданных" })
    @ApiResponse({ status: 200, description: "Метаданные успешно обновлены" })
    @ApiResponse({ status: 404, description: "Метаданные не найдены" })
    @Put("/:id")
    async updateGoogleSheetsMetadataById(@Body() dto: UpdateGoogleSheetsMetadataDto, @Param("id", ParseIntPipe) id: number) {
        try {
            return await this.googleSheetsMetadataService.updateGoogleSheetsMetadataById(id, dto);
        } catch (e) {
            this.logger.error(`Error in GoogleSheetsMetadataController:\n${e}`);
            throw new HttpException("Ошибка при обновлении метаданных Google Sheets", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Удалить метаданные Google Sheets по ID" })
    @ApiParam({ name: "id", type: "number", description: "ID метаданных" })
    @ApiResponse({ status: 200, description: "Метаданные успешно удалены" })
    @ApiResponse({ status: 404, description: "Метаданные не найдены" })
    @Delete("/:id")
    async deleteGoogleSheetsMetadataById(@Param("id", ParseIntPipe) id: number) {
        try {
            return await this.googleSheetsMetadataService.deleteGoogleSheetsMetadataById(id);
        } catch (e) {
            this.logger.error(`Error in GoogleSheetsMetadataController:\n${e}`);
            throw new HttpException("Ошибка при удалении метаданных Google Sheets", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
