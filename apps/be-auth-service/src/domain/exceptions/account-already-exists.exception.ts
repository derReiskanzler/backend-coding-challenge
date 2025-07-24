import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountAlreadyExistsException extends HttpException {
    public override readonly name = 'ACCOUNT_ALREADY_EXISTS';

    public static withUsername(username: string): AccountAlreadyExistsException {
        return new AccountAlreadyExistsException(`Account with username: '${username}' already exists!`, HttpStatus.CONFLICT);
    }
}