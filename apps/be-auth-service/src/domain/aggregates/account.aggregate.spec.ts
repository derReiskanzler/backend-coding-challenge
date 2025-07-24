import {
    AccountId,
    Password,
    UserSignedUpEvent,
    Username,
} from '@backend-monorepo/domain';
import { AggregateId, Encryptor } from '@backend-monorepo/boilerplate';
import { Account } from './account.aggregate';
import { AccountState } from './account.state';
import { AccountAlreadyExistsException } from '../exceptions/account-already-exists.exception';

// Mock the Encryptor
jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    Encryptor: {
        encrypt: jest.fn(),
    },
}));

describe('Account Aggregate', () => {
    const mockEncryptor = Encryptor as jest.Mocked<typeof Encryptor>;
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signUp', () => {
        const validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
        const validUsername = Username.fromString('testuser');
        const validPassword = Password.fromString('ValidPass123!');
        const mockEncryptedResult = {
            passwordHash: 'hashed-password',
            salt: 'salt-value'
        };

        beforeEach(() => {
            mockEncryptor.encrypt.mockReturnValue(mockEncryptedResult);
        });

        it('should create an account when no existing username is provided', () => {
            const account = Account.signUp(null, {
                accountId: validAccountId,
                username: validUsername,
                password: validPassword,
            });

            expect(account).toBeInstanceOf(Account);
            expect(mockEncryptor.encrypt).toHaveBeenCalledWith('ValidPass123!');
            expect(account.getPendingEvents()).toHaveLength(1);
            
            const event = account.getPendingEvents()[0] as UserSignedUpEvent;
            expect(event).toBeInstanceOf(UserSignedUpEvent);
            expect(event.getId()).toBe(validAccountId.toString());
            expect(event.getUsername()).toBe(validUsername.toString());
            expect(event.getPasswordHash()).toBe(mockEncryptedResult.passwordHash);
            expect(event.getSalt()).toBe(mockEncryptedResult.salt);
        });

        it('should throw AccountAlreadyExistsException when existing username is provided', () => {
            const existingUsername = Username.fromString('existinguser');

            expect(() => Account.signUp(existingUsername, {
                accountId: validAccountId,
                username: validUsername,
                password: validPassword,
            })).toThrow(AccountAlreadyExistsException);

            expect(() => Account.signUp(existingUsername, {
                accountId: validAccountId,
                username: validUsername,
                password: validPassword,
            })).toThrow(`Account with username: '${validUsername.toString()}' already exists!`);

            expect(mockEncryptor.encrypt).not.toHaveBeenCalled();
        });

        it('should encrypt password before recording event', () => {
            Account.signUp(null, {
                accountId: validAccountId,
                username: validUsername,
                password: validPassword,
            });

            expect(mockEncryptor.encrypt).toHaveBeenCalledTimes(1);
            expect(mockEncryptor.encrypt).toHaveBeenCalledWith(validPassword.toString());
        });

        it('should handle different password values correctly', () => {
            const differentPassword = Password.fromString('DifferentP@ss123!');
            const differentEncryptedResult = {
                passwordHash: 'different-hashed-password',
                salt: 'different-salt-value'
            };
            
            mockEncryptor.encrypt.mockReturnValue(differentEncryptedResult);

            const account = Account.signUp(null, {
                accountId: validAccountId,
                username: validUsername,
                password: differentPassword,
            });

            const event = account.getPendingEvents()[0] as UserSignedUpEvent;
            expect(event.getPasswordHash()).toBe(differentEncryptedResult.passwordHash);
            expect(event.getSalt()).toBe(differentEncryptedResult.salt);
            expect(mockEncryptor.encrypt).toHaveBeenCalledWith('DifferentP@ss123!');
        });
    });

    describe('onUserSignedUpEvent', () => {
        it('should update the state when handling AccountCreatedEvent', () => {
            const account = new Account();
            const event = UserSignedUpEvent.create(
                '123e4567-e89b-12d3-a456-426614174000',
                'testuser',
                'hashed-password',
                'salt-value'
            );

            account.onUserSignedUpEvent(event);

            const state = account.getState() as AccountState;
            expect(state.getId()).toBe('123e4567-e89b-12d3-a456-426614174000');
            expect(state.getUsername()).toBe('testuser');
            expect(state.getPasswordHash()).toBe('hashed-password');
            expect(state.getSalt()).toBe('salt-value');
        });

        it('should handle multiple event applications correctly', () => {
            const account = new Account();
            
            const firstEvent = UserSignedUpEvent.create(
                'first-id',
                'firstuser',
                'first-hash',
                'first-salt'
            );
            
            const secondEvent = UserSignedUpEvent.create(
                'second-id', 
                'seconduser',
                'second-hash',
                'second-salt'
            );

            account.onUserSignedUpEvent(firstEvent);
            account.onUserSignedUpEvent(secondEvent);

            const state = account.getState() as AccountState;
            // The second event should override the first
            expect(state.getId()).toBe('second-id');
            expect(state.getUsername()).toBe('seconduser');
            expect(state.getPasswordHash()).toBe('second-hash');
            expect(state.getSalt()).toBe('second-salt');
        });
    });

    describe('getAggregateId', () => {
        it('should return AggregateId from state', () => {
            const account = new Account();
            const event = UserSignedUpEvent.create(
                '123e4567-e89b-12d3-a456-426614174000',
                'testuser',
                'hashed-password',
                'salt-value'
            );

            account.onUserSignedUpEvent(event);
            
            const aggregateId = account.getAggregateId();
            expect(aggregateId).toBeInstanceOf(AggregateId);
            expect(aggregateId.toString()).toBe('123e4567-e89b-12d3-a456-426614174000');
        });

        it('should throw error when state is not initialized', () => {
            const account = new Account();

            expect(() => account.getAggregateId()).toThrow();
        });
    });

    describe('getState', () => {
        it('should return the current state', () => {
            const account = new Account();
            const event = UserSignedUpEvent.create(
                '123e4567-e89b-12d3-a456-426614174000',
                'testuser',
                'hashed-password',
                'salt-value'
            );

            account.onUserSignedUpEvent(event);
            
            const state = account.getState();
            expect(state).toBeInstanceOf(AccountState);
            expect(state.getId()).toBe('123e4567-e89b-12d3-a456-426614174000');
        });

        it('should return undefined when no state is set', () => {
            const account = new Account();
            
            const state = account.getState();
            expect(state).toBeUndefined();
        });
    });

    describe('integration with event recording', () => {
        it('should properly record and handle AccountCreatedEvent during signUp', () => {
            const validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
            const validUsername = Username.fromString('testuser');
            const validPassword = Password.fromString('ValidPass123!');
            
            mockEncryptor.encrypt.mockReturnValue({
                passwordHash: 'hashed-password',
                salt: 'salt-value'
            });

            const account = Account.signUp(null, {
                accountId: validAccountId,
                username: validUsername,
                password: validPassword,
            });

            // Check that the event was recorded and the state was updated
            expect(account.getPendingEvents()).toHaveLength(1);
            
            const state = account.getState() as AccountState;
            expect(state.getId()).toBe(validAccountId.toString());
            expect(state.getUsername()).toBe(validUsername.toString());
            expect(state.getPasswordHash()).toBe('hashed-password');
            expect(state.getSalt()).toBe('salt-value');
        });
    });

    describe('immutability and state consistency', () => {
        it('should maintain state consistency across multiple operations', () => {
            const validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
            const validUsername = Username.fromString('testuser');
            const validPassword = Password.fromString('ValidPass123!');
            
            mockEncryptor.encrypt.mockReturnValue({
                passwordHash: 'hashed-password',
                salt: 'salt-value'
            });

            const account = Account.signUp(null, {
                accountId: validAccountId,
                username: validUsername,
                password: validPassword,
            });

            const state1 = account.getState();
            const state2 = account.getState();
            const aggregateId1 = account.getAggregateId();
            const aggregateId2 = account.getAggregateId();

            // Multiple calls should return consistent results
            expect(state1.getId()).toBe(state2.getId());
            expect(aggregateId1.toString()).toBe(aggregateId2.toString());
        });
    });
});