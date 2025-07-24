import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
    @ApiProperty({
        description: 'Username for the new account',
        example: 'john_doe123',
        minLength: 1,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'Password for the new account. Must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        example: 'MySecurePass123!',
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{8,}$',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^.{8,}$/, { message: 'Password must be at least 8 characters long' })
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    @Matches(/\W/, { message: 'Password must contain at least one special character' })
    @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
    password: string;
}
