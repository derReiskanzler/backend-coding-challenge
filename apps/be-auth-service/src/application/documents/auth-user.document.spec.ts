import { ReadmodelDocument } from '@backend-monorepo/boilerplate';
import { AuthUserDocument } from './auth-user.document';

describe('AuthUserDocument', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';
    const validUsername = 'john.doe';

    it('should create instance with valid id and username', () => {
        const document = new AuthUserDocument(validId, validUsername, new Date());

        expect(document).toBeInstanceOf(AuthUserDocument);
    });

    it('should store id and username correctly', () => {
        const document = new AuthUserDocument(validId, validUsername, new Date());

        expect(document.id).toBe(validId);
        expect(document.username).toBe(validUsername);
        expect(document.createdAt).toBeInstanceOf(Date);
    });

    it('should have correct ID constant', () => {
        expect(AuthUserDocument.ID).toBe('id');
    });

    it('should have correct USERNAME constant', () => {
        expect(AuthUserDocument.USERNAME).toBe('username');
    });

    it('should have correct CREATED_AT constant', () => {
        expect(AuthUserDocument.CREATED_AT).toBe('createdAt');
    });

    it('should extend ReadmodelDocument class', () => {
        const document = new AuthUserDocument(validId, validUsername, new Date());

        expect(document).toBeInstanceOf(ReadmodelDocument);
    });

    it('should call parent constructor with correct mapping', () => {
        const createdAt = new Date();
        const document = new AuthUserDocument(validId, validUsername, createdAt);

        expect(document).toHaveProperty('id', validId);
        expect(document).toHaveProperty('username', validUsername);
        expect(document).toHaveProperty('createdAt', createdAt);
    });
});
