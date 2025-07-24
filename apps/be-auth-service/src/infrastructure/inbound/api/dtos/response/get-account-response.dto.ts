import { ApiProperty } from '@nestjs/swagger';

export class GetAccountResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the user account',
        example: 'abc123def-456-789-ghi012jkl',
        type: String,
    })
    id: string;

    @ApiProperty({
        description: 'Username of the account',
        example: 'john_doe123',
        type: String,
    })
    username: string;

    @ApiProperty({
        description: 'Timestamp when the account was created',
        example: '2024-01-15T10:30:00.000Z',
        type: String,
        format: 'date-time',
    })
    createdAt: string;
}

export class AccountNotFoundResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 404,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message',
        example: 'Account not found',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Not Found',
        type: String,
    })
    error: string;
}

export class UnauthorizedResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 401,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message',
        example: 'Unauthorized',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Unauthorized',
        type: String,
    })
    error: string;
} 