import { Test, TestingModule } from '@nestjs/testing';
import { ValidateV1Action } from './validate.action';
import { AuthenticatedUser } from '@backend-monorepo/boilerplate';

describe('ValidateV1Action', () => {
    let action: ValidateV1Action;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ValidateV1Action],
        }).compile();

        action = module.get<ValidateV1Action>(ValidateV1Action);
    });

    describe('index', () => {
        const mockUser: AuthenticatedUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'testuser',
        };

        it('should return the authenticated user', async () => {
            const result = await action.index(mockUser);

            expect(result).toBe(mockUser);
        });
    });
});
