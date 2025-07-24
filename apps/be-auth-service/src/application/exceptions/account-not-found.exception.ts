import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountNotFoundException extends HttpException {
    public name = 'ACCOUNT_NOT_FOUND';

    public static withId(id: string): AccountNotFoundException {
        return new AccountNotFoundException(`Account with id: '${id}' not found`, HttpStatus.NOT_FOUND);
    }
}
