import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTariffDto {
    @ApiProperty({
        description: "Экспресс-доставка и хранение коробки (в числовом формате)",
        example: 100,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    boxDeliveryAndStorageExpr: number;

    @ApiProperty({
        description: "Базовый тариф на доставку коробки",
        example: "Base delivery rate for box",
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    boxDeliveryBase: string;

    @ApiProperty({
        description: "Литера коробки для доставки",
        example: "Liter for box delivery",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    boxDeliveryLiter: string;

    @ApiProperty({
        description: "Базовый тариф на хранение коробки",
        example: "Base storage rate for box",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    boxStorageBase: string;

    @ApiProperty({
        description: "Литера коробки для хранения",
        example: "Liter for box storage",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    boxStorageLiter: string;

    @ApiProperty({
        description: "Название склада, для которого указаны тарифы",
        example: "Warehouse A",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    warehouseName: string;
}
