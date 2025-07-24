import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthUserDocumentNotFoundException extends HttpException {
    public name = 'AUTH_USER_DOCUMENT_NOT_FOUND';

    public static withId(id: string): AuthUserDocumentNotFoundException {
        return new AuthUserDocumentNotFoundException(`Auth user document with id: '${id}' not found`, HttpStatus.NOT_FOUND);
    }
}
