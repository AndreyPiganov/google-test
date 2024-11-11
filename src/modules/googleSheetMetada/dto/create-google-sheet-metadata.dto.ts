import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateGoogleSheetsMetadataDto {
    @ApiProperty({ description: "Идентификатор таблицы" })
    @IsString()
    @IsNotEmpty()
    spreadsheet_id: string;

    @ApiProperty({ description: "Флаг, указывающий, заполнена ли таблица" })
    @IsOptional()
    @IsBoolean()
    is_filled: boolean;

    @ApiProperty({ description: "Дата создания записи" })
    created_at: Date;
}
