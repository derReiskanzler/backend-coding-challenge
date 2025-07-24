import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsernameDto {
    @ApiProperty({
        description: 'New username for the account. Must be unique across all users.',
        example: 'john_doe_updated',
        minLength: 3,
        maxLength: 50,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(50, { message: 'Username must not exceed 50 characters' })
    username: string;
} 