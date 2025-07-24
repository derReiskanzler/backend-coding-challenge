import { ApiProperty } from '@nestjs/swagger';

export class ForbiddenResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 403,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message',
        example: 'You can only update your own account',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Forbidden',
        type: String,
    })
    error: string;
}

export class ConflictResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 409,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message',
        example: 'Account with username already exists',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Conflict',
        type: String,
    })
    error: string;
} 