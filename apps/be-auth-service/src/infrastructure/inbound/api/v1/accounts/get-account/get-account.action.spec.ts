import { Test, TestingModule } from '@nestjs/testing';
import { QueryBusService } from '@backend-monorepo/boilerplate';
import { AccountId } from '@backend-monorepo/domain';
import { GetAccountQuery } from '../../../../../../application/use-cases/get-account/get-account.query';
import { AuthUserDocument } from '../../../../../../application/documents/auth-user.document';
import { GetAccountV1Action } from './get-account.action';

describe('GetAccountV1Action', () => {
    let action: GetAccountV1Action;
    let mockQueryBus: jest.Mocked<QueryBusService>;
    
    beforeEach(async () => {
        const mockQueryBusService = {
            dispatch: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GetAccountV1Action],
            providers: [
                {
                    provide: QueryBusService,
                    useValue: mockQueryBusService,
                },
            ],
        }).compile();

        action = module.get<GetAccountV1Action>(GetAccountV1Action);
        mockQueryBus = module.get(QueryBusService);

        jest.clearAllMocks();
    });

    describe('index', () => {
        const mockAccountId = '123e4567-e89b-12d3-a456-426614174000';
        const mockAccount = new AuthUserDocument(
            mockAccountId,
            'testtitle',
            new Date(),
        );

        const validQuery = new GetAccountQuery(
            AccountId.fromString(mockAccountId),
        );

        it('should get movie rating successfully', async () => {
            mockQueryBus.dispatch.mockResolvedValue(mockAccount);

            await action.index(validQuery.getId().toString());

            expect(mockQueryBus.dispatch).toHaveBeenCalledWith(validQuery);
            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should create GetAccountQuery with correct parameters', async () => {
            mockQueryBus.dispatch.mockResolvedValue(mockAccount);

            await action.index(validQuery.getId().toString());

            const dispatchedQuery = mockQueryBus.dispatch.mock.calls[0][0] as GetAccountQuery;
            expect(dispatchedQuery).toBeInstanceOf(GetAccountQuery);
            expect(dispatchedQuery.getId().toString()).toBe(mockAccountId);
        });

        it('should handle different valid account ids', async () => {
            const testCases = [
                { id: '123e4567-e89b-12d3-a456-426614174000' },
                { id: '123e4567-e89b-12d3-a456-426614174001' },
                { id: '123e4567-e89b-12d3-a456-426614174002' },
            ];

            for (const testCase of testCases) {
                const validQuery = new GetAccountQuery(
                    AccountId.fromString(testCase.id),
                );

                await action.index(validQuery.getId().toString());

                const dispatchedQuery = mockQueryBus.dispatch.mock.calls[
                    mockQueryBus.dispatch.mock.calls.length - 1
                ][0] as GetAccountQuery;
                expect(dispatchedQuery.getId().toString()).toBe(testCase.id);
            }
        });

        it('should propagate errors from query bus', async () => {
            const errorMsg = 'Error getting account';
            mockQueryBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validQuery.getId().toString())).rejects.toThrow(
                errorMsg
            );

            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(1);
        });
    });

    describe('response handling', () => {
        const mockAccountId = '123e4567-e89b-12d3-a456-426614174000';
        const mockAccount = new AuthUserDocument(
            mockAccountId,
            'testtitle',
            new Date(),
        );

        const validQuery = new GetAccountQuery(
            AccountId.fromString(mockAccountId),
        );

        it('should return void from index method', async () => {
            mockQueryBus.dispatch.mockResolvedValue(mockAccount);

            const result = await action.index(validQuery.getId().toString());

            expect(result).toBe(mockAccount);
        });
    });

    it('should handle multiple consecutive requests', async () => {
        const accountIds = ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'];

        for (let i = 0; i < accountIds.length; i++) {
            const validQuery = new GetAccountQuery(
                AccountId.fromString(accountIds[i]),
            );

            await action.index(validQuery.getId().toString());

            expect(mockQueryBus.dispatch).toHaveBeenCalledWith(validQuery);
            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(i + 1);
        }

        expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(3);
    });
});
