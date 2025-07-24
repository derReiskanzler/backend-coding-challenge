import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^.{8,}$/, { message: 'Password must be at least 8 characters long' })
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    @Matches(/\W/, { message: 'Password must contain at least one special character' })
    @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
    password: string;
}
