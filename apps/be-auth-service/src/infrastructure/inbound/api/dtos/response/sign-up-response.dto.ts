import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
    @ApiProperty({
        description: 'Success message indicating account creation',
        example: 'Account created successfully',
        type: String,
    })
    message: string;
}

export class ErrorResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 400,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message or array of validation errors',
        oneOf: [
            { type: 'string', example: 'Error message' },
            { 
                type: 'array', 
                items: { type: 'string' }, 
                example: ['Password must be at least 8 characters long', 'Password must contain at least one uppercase letter'] 
            }
        ],
    })
    message: string | string[];

    @ApiProperty({
        description: 'Error type',
        example: 'Bad Request',
        type: String,
    })
    error: string;
} 