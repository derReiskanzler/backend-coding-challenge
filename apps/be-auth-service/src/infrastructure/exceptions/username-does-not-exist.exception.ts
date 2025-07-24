import { HttpException, HttpStatus } from '@nestjs/common';

export class UsernameDoesNotExistException extends HttpException {
    public name = 'USERNAME_DOES_NOT_EXIST';

    public static withUsername(username: string): UsernameDoesNotExistException {
        return new UsernameDoesNotExistException(`Username: '${username}' does not exist.`, HttpStatus.UNAUTHORIZED);
    }
}
