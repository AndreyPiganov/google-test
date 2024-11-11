import { Module } from "@nestjs/common";
import { TariffController } from "./tariffs.controller";
import { TariffService } from "./tariffs.service";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [TariffController],
    providers: [TariffService],
})
export class TariffsModule {}
