import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { SortDirection, SortDirectionEnum } from '@backend-monorepo/boilerplate';

export class GetMovieRatingsDto {
    @IsOptional()
    @IsUUID()
    accountId?: string|undefined;

    @IsOptional()
    @IsString()
    title?: string|undefined;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    skip?: number|undefined;
    
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    take?: number|undefined;
    
    @IsOptional()
    @IsString()
    sortField?: string|undefined;
    
    @IsOptional()
    @IsEnum(SortDirectionEnum)
    sortDirection?: SortDirection|undefined;
}