import configuration from "../../config/configuration";
import { DatabaseModule } from "../database/database.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import { winstonConfig } from "../../config/winston.config";
import { Reflector, APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "../../common/interceptors/LogginInterceptor";
import { KnexModule } from "nest-knexjs";
import { TariffsModule } from "../tariffs/tariffs.module";
import { ScheduleModule } from "@nestjs/schedule";
import { DataExportModule } from "../dataExport/data-export.module";
import { GoogleSheetsMetadataModule } from "../googleSheetMetada/googleSheetMetadata.module";

const configService = new ConfigService();
const DB_URL = configService.get<string>("DATABASE_URL");

@Module({
    imports: [
        DatabaseModule,
        TariffsModule,
        DataExportModule,
        GoogleSheetsMetadataModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        WinstonModule.forRoot({
            transports: winstonConfig.transports,
            format: winstonConfig.format,
            level: winstonConfig.level,
        }),
        KnexModule.forRoot({
            config: {
                client: "pg",
                connection: DB_URL,
            },
        }),
        ScheduleModule.forRoot(),
    ],
    controllers: [],
    providers: [Reflector, { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
