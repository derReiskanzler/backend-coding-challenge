import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { SortDirection, SortDirectionEnum } from '@backend-monorepo/boilerplate';
import { ApiProperty } from '@nestjs/swagger';

export class GetMovieRatingsDto {
    @ApiProperty({
        description: 'Filter by account ID to get ratings from a specific user',
        example: 'abc123def-456-789-ghi012jkl',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsUUID()
    accountId?: string|undefined;

    @ApiProperty({
        description: 'Filter by movie title (partial match supported)',
        example: 'Shawshank',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string|undefined;

    @ApiProperty({
        description: 'Number of results to skip for pagination',
        example: 0,
        type: Number,
        required: false,
        minimum: 0,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    skip?: number|undefined;
    
    @ApiProperty({
        description: 'Number of results to return (page size)',
        example: 10,
        type: Number,
        required: false,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    take?: number|undefined;
    
    @ApiProperty({
        description: 'Field to sort by',
        example: 'title',
        type: String,
        required: false,
        enum: ['title', 'stars', 'createdAt'],
    })
    @IsOptional()
    @IsString()
    sortField?: string|undefined;
    
    @ApiProperty({
        description: 'Sort direction',
        example: SortDirectionEnum.ASC,
        enum: SortDirectionEnum,
        required: false,
    })
    @IsOptional()
    @IsEnum(SortDirectionEnum)
    sortDirection?: SortDirection|undefined;
}