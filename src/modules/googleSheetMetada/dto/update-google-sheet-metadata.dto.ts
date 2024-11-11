import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdateGoogleSheetsMetadataDto {
    @ApiProperty({ description: "Идентификатор таблицы", required: false })
    @IsString()
    @IsOptional()
    spreadsheet_id?: string;

    @ApiProperty({ description: "Название листа", required: false })
    @IsString()
    @IsOptional()
    sheet_name?: string;

    @ApiProperty({ description: "Флаг, указывающий, заполнена ли таблица", required: false })
    @IsBoolean()
    @IsOptional()
    is_filled?: boolean;

    @ApiProperty({ description: "Дата создания записи", required: false })
    @IsOptional()
    created_at?: Date;
}
