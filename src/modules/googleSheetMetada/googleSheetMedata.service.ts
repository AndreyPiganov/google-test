import { Injectable, Inject, LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { DatabaseService } from "../database/database.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UpdateGoogleSheetsMetadataDto } from "./dto/update-google-sheet-metadata.dto";
import { CreateGoogleSheetsMetadataDto } from "./dto/create-google-sheet-metadata.dto";
import { GoogleSheetsMetadata } from "src/common/types/googleSheetMetadata";

@ApiTags("Google Sheets Metadata")
@Injectable()
export class GoogleSheetsMetadataService {
    constructor(
        private readonly db: DatabaseService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    @ApiOperation({ summary: "Получить все метаданные" })
    @ApiResponse({ status: 200, description: "Метаданные успешно получены", type: [GoogleSheetsMetadata] })
    async getAllGoogleSheetsMetadata(): Promise<GoogleSheetsMetadata[]> {
        this.logger.log("Fetching all google sheets metadata");
        try {
            const data = await this.db.getAll("google_sheets_metadata");
            this.logger.log("Fetched all google sheets metadata");
            return data;
        } catch (e) {
            this.logger.error("Error fetching all google sheets metadata", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Получить метаданные по ID" })
    @ApiResponse({ status: 200, description: "Метаданные успешно найдены", type: GoogleSheetsMetadata })
    async getGoogleSheetsMetadataById(id: number): Promise<GoogleSheetsMetadata> {
        try {
            const metadata = await this.db.getOneById("google_sheets_metadata", id);
            this.logger.log("Fetched google sheets metadata by id");
            return metadata;
        } catch (e) {
            this.logger.error("Error fetching google sheets metadata by id", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Создать метаданные" })
    @ApiResponse({ status: 201, description: "Метаданные успешно созданы", type: GoogleSheetsMetadata })
    async createGoogleSheetsMetadata(dto: CreateGoogleSheetsMetadataDto): Promise<GoogleSheetsMetadata> {
        try {
            const metadata = await this.db.insertData("google_sheets_metadata", dto);
            this.logger.log("Created google sheets metadata");
            return metadata;
        } catch (e) {
            this.logger.error("Error creating google sheets metadata", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Обновить метаданные по ID" })
    @ApiResponse({ status: 200, description: "Метаданные успешно обновлены", type: GoogleSheetsMetadata })
    async updateGoogleSheetsMetadataById(id: number, dto: UpdateGoogleSheetsMetadataDto): Promise<GoogleSheetsMetadata> {
        try {
            const updatedMetadata = await this.db.updateById("google_sheets_metadata", id, dto);
            this.logger.log("Updated google sheets metadata by id");
            return updatedMetadata;
        } catch (e) {
            this.logger.error("Error updating google sheets metadata by id", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Удалить метаданные по ID" })
    @ApiResponse({ status: 200, description: "Метаданные успешно удалены" })
    async deleteGoogleSheetsMetadataById(id: number): Promise<number> {
        try {
            const deletedRows = await this.db.deleteById("google_sheets_metadata", id);
            this.logger.log("Deleted google sheets metadata by id");
            return deletedRows;
        } catch (e) {
            this.logger.error("Error deleting google sheets metadata by id", e);
            throw e;
        }
    }

    @ApiOperation({ summary: "Удалить метаданные по spreadsheet_id" })
    @ApiResponse({ status: 200, description: "Метаданные успешно удалены" })
    async deleteGoogleSheetsMetadataBySpreadsheetId(spreadsheetId: string): Promise<number> {
        try {
            const deletedRows = await this.db.knex("google_sheets_metadata").where("spreadsheet_id", spreadsheetId).del();
            this.logger.log("Deleted google sheets metadata by spreadsheet_id");
            return deletedRows;
        } catch (e) {
            this.logger.error("Error deleting google sheets metadata by spreadsheet_id", e);
            throw e;
        }
    }
}
