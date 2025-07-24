import { ReadmodelDocument } from '@backend-monorepo/boilerplate';
import { AuthUserDocument } from './auth-user.document';

describe('AuthUserDocument', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';
    const validUsername = 'john.doe';

    it('should create instance with valid id and username', () => {
        const document = new AuthUserDocument(validId, validUsername);

        expect(document).toBeInstanceOf(AuthUserDocument);
    });

    it('should store id and username correctly', () => {
        const document = new AuthUserDocument(validId, validUsername);

        expect(document.id).toBe(validId);
        expect(document.username).toBe(validUsername);
    });

    it('should have correct ID constant', () => {
        expect(AuthUserDocument.ID).toBe('id');
    });

    it('should have correct USERNAME constant', () => {
        expect(AuthUserDocument.USERNAME).toBe('username');
    });

    it('should extend ReadmodelDocument class', () => {
        const document = new AuthUserDocument(validId, validUsername);

        expect(document).toBeInstanceOf(ReadmodelDocument);
    });

    it('should call parent constructor with correct mapping', () => {
        const document = new AuthUserDocument(validId, validUsername);

        expect(document).toHaveProperty('id', validId);
        expect(document).toHaveProperty('username', validUsername);
    });
});
