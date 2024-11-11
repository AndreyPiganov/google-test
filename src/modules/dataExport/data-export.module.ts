import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { DataExportService } from "./data-export.service";
import { DataExportController } from "./data-export.controller";

@Module({
    imports: [DatabaseModule],
    controllers: [DataExportController],
    providers: [DataExportService],
})
export class DataExportModule {}
