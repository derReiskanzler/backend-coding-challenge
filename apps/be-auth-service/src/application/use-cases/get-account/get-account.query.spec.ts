import { Query } from '@backend-monorepo/boilerplate';
import { AccountId } from '@backend-monorepo/domain';
import { GetAccountQuery } from './get-account.query';

describe('GetAccountQuery', () => {
    let validAccountId: AccountId;

    beforeEach(() => {
        validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should create instance with valid account id', () => {
        const query = new GetAccountQuery(validAccountId);

        expect(query).toBeInstanceOf(GetAccountQuery);
        expect(query).toBeInstanceOf(Query);
    });

    it('should return the account id passed in constructor', () => {
        const query = new GetAccountQuery(validAccountId);

        expect(query.getId()).toBe(validAccountId);
    });

    it('should extend Query class', () => {
        const query = new GetAccountQuery(validAccountId);

        expect(query).toBeInstanceOf(Query);
    });
});