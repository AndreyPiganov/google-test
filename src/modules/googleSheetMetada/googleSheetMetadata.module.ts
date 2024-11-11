import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { GoogleSheetsMetadataService } from "./googleSheetMedata.service";
import { GoogleSheetsMetadataController } from "./googleSheetMetadata.controller";

@Module({
    imports: [DatabaseModule],
    controllers: [GoogleSheetsMetadataController],
    providers: [GoogleSheetsMetadataService],
})
export class GoogleSheetsMetadataModule {}
