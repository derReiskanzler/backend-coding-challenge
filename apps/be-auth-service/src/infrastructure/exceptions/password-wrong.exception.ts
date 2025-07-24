import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordWrongException extends HttpException {
    public name = 'PASSWORD_WRONG';

    public static create(): PasswordWrongException {
        return new PasswordWrongException(`Password is wrong.`, HttpStatus.UNAUTHORIZED);
    }
}
