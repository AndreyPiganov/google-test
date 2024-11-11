import { Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { DataExportService } from "./data-export.service";
import { LoggerService } from "@nestjs/common";
import { google } from "googleapis";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import * as fs from "fs";
import path from "path";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Data Export")
@Controller()
export class DataExportController {
    constructor(
        private readonly dataExportService: DataExportService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    @ApiOperation({ summary: "Получить ссылку для авторизации в Google" })
    @ApiResponse({ status: 200, description: "Ссылка для авторизации получена", type: Object })
    @Get("/google")
    async getGoogleAuthUrl(): Promise<{ url: string }> {
        try {
            const { OAuth2 } = google.auth;
            const clientCredentials = this.dataExportService.getClientCredentials();
            const oauth2Client = new OAuth2(clientCredentials.client_id, clientCredentials.client_secret, "http://localhost");
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: ["https://www.googleapis.com/auth/spreadsheets"],
            });

            this.logger.log("Ссылка для авторизации получена успешно");
            return { url: authUrl };
        } catch (error) {
            this.logger.error("Ошибка при получении ссылки для авторизации", error);
            throw error;
        }
    }

    @ApiOperation({ summary: "Получить токен по коду авторизации Google" })
    @ApiResponse({ status: 200, description: "Токен успешно сохранен" })
    @ApiResponse({ status: 400, description: "Ошибка при получении токена" })
    @Post("/token/:code")
    async getTokenByCodeGoogle(@Param("code") code: string) {
        const { OAuth2 } = google.auth;
        const clientCredentials = this.dataExportService.getClientCredentials();
        const oauth2Client = new OAuth2(clientCredentials.client_id, clientCredentials.client_secret, "http://localhost");
        oauth2Client.getToken(code, (err, token) => {
            if (err) {
                this.logger.error("Error retrieving access token", err);
                return;
            }
            fs.writeFileSync(path.resolve(__dirname, "../../../src/config/token.json"), JSON.stringify(token));
            this.logger.log("Token stored to token.json");
        });
    }
}
