import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DatabaseService } from "../database/database.service";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { google, sheets_v4 } from "googleapis";
import * as fs from "fs";
import { GoogleToken } from "../../common/types/googleToken";
import { Tariff } from "../../common/interfaces/tariff";
import path from "path";
import { ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { GoogleSheetsMetadata } from "../../common/types/googleSheetMetadata";

@ApiTags("Data Export") // Swagger будет группировать все методы этого сервиса под тегом "Data Export"
@Injectable()
export class DataExportService {
    constructor(
        private readonly db: DatabaseService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    @ApiOperation({ summary: "Периодический экспорт данных в Google Sheets" })
    @ApiResponse({ status: 200, description: "Данные успешно загружены в Google Sheets" })
    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleCron(): Promise<void> {
        this.logger.log("API request and data update completed successfully");
        try {
            const oauth2Client = await this.authorize();
            const sheets = google.sheets({ version: "v4", auth: oauth2Client });

            const res: Tariff[] = await this.db.getAll("tariffs", "boxDeliveryAndStorageExpr");
            const headerValues = Object.keys(res[0]);
            const dataValues = res.map(Object.values);
            const shreadSheetsIds = await this.db
                .knex("google_sheets_metadata")
                .select("*") // Выбираем все поля
                .where("is_filled", false); // Фильтруем по is_filled = false

            await this.updateGoogleSheets(sheets, { headerValues, dataValues }, shreadSheetsIds);

            this.logger.log("Данные успешно загружены в Google Sheets");
        } catch (error) {
            this.logger.error("Данные не загружены в Google Sheets", error);
            throw error;
        }
    }

    @ApiOperation({ summary: "Авторизация для работы с Google API" })
    @ApiResponse({ status: 200, description: "Авторизация прошла успешно" })
    async authorize(): Promise<any> {
        const { OAuth2 } = google.auth;
        const clientCredentials = this.getClientCredentials();
        const oauth2Client = new OAuth2(clientCredentials.client_id, clientCredentials.client_secret, "http://localhost");

        let tokens: GoogleToken = this.getTokensFromFile();
        if (!tokens) {
            throw new Error("Токены не найдены");
        }

        tokens = await this.refresh(tokens, oauth2Client);
        oauth2Client.setCredentials(tokens);

        return oauth2Client;
    }

    @ApiOperation({ summary: "Получение токенов доступа" })
    @ApiResponse({ status: 200, description: "Токены успешно получены", type: GoogleToken })
    private getTokensFromFile(): GoogleToken | null {
        try {
            const filePath = path.resolve(__dirname, "../../../src/config/token.json");
            this.logger.log(`Чтение токенов из файла: ${filePath}`);
            return JSON.parse(fs.readFileSync(filePath, "utf-8").toString());
        } catch (error) {
            this.logger.error("Не удалось прочитать токен из файла", error);
            throw error;
        }
    }

    @ApiOperation({ summary: "Получение данных клиента для OAuth авторизации" })
    @ApiResponse({ status: 200, description: "Данные клиента успешно получены", type: Object })
    getClientCredentials(): any {
        try {
            const filePath = path.resolve(__dirname, `../../../src/config/credentials.json`);
            this.logger.log(`Чтение данных клиента из файла: ${filePath}`);
            const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8").toString());
            return parsed.installed;
        } catch (error) {
            this.logger.error("Не удалось прочитать данные из файла", error);
            throw error;
        }
    }

    @ApiOperation({ summary: "Обновление токенов доступа при их истечении" })
    @ApiResponse({ status: 200, description: "Токены успешно обновлены", type: GoogleToken })
    private async refresh(tokens: GoogleToken, oauth2Client: any): Promise<GoogleToken> {
        if (oauth2Client.isTokenExpiring()) {
            try {
                const { credentials } = await oauth2Client.refreshAccessToken();
                tokens = credentials as GoogleToken;
                const filePath = path.resolve(__dirname, "../../../src/config/token.json");
                fs.writeFileSync(filePath, JSON.stringify(tokens));
                this.logger.log("Токены успешно обновлены");
            } catch (error) {
                this.logger.error("Не удалось обновить токены", error);
                throw error;
            }
        }
        return tokens;
    }

    @ApiOperation({ summary: "Обновление данных в Google Sheets" })
    @ApiResponse({ status: 200, description: "Данные успешно обновлены в Google Sheets" })
    private async updateGoogleSheets(
        sheets: sheets_v4.Sheets,
        data: { headerValues: string[]; dataValues: any[] },
        spreadSheets: GoogleSheetsMetadata[],
    ): Promise<void> {
        try {
            const sheetName = "stocks_coefs";
            const spreadSheetsIds = spreadSheets.map((spreadSheet) => spreadSheet.spreadsheet_id);

            for (let spreadsheetId of spreadSheetsIds) {
                // Очищаем лист
                await sheets.spreadsheets.values.clear({
                    spreadsheetId,
                    range: `${sheetName}!A1:Z1000`,
                });
                // Записываем заголовки
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `${sheetName}!A1`,
                    valueInputOption: "RAW",
                    requestBody: {
                        values: [data.headerValues],
                    },
                });

                // Добавляем данные
                await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: `${sheetName}!A2`,
                    valueInputOption: "RAW",
                    requestBody: {
                        values: data.dataValues,
                    },
                });
            }
        } catch (error) {
            this.logger.error("Ошибка при обновлении Google Sheets", error);
            throw error;
        }
    }
}
