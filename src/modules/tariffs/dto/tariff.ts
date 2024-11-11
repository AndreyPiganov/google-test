import { ApiProperty } from "@nestjs/swagger";

export class TariffType {
    id: number;
    @ApiProperty({ description: "Коэффициент" })
    boxDeliveryAndStorageExpr: string;
    @ApiProperty({ description: "Название склада" })
    warehouseName: string;

    @ApiProperty({ description: "Цена доставки" })
    boxDeliveryBase: number;

    @ApiProperty({ description: "Цена хранения" })
    boxStorageBase: number;

    @ApiProperty({ description: "Доставка по литрам" })
    boxDeliveryLiter: number;

    @ApiProperty({ description: "Хранение по литрам" })
    boxStorageLiter: number;
}
