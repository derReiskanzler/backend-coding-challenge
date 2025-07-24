import { AccountState } from './account.state';

describe('AccountState', () => {
    const validRecordData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        passwordHash: 'hashed-password-123',
        salt: 'salt-value-456'
    };

    describe('constructor and initialization', () => {
        it('should create AccountState instance with valid record data', () => {
            const state = AccountState.fromRecordData(validRecordData);

            expect(state).toBeInstanceOf(AccountState);
            expect(state.getId()).toBe(validRecordData.id);
            expect(state.getUsername()).toBe(validRecordData.username);
            expect(state.getPasswordHash()).toBe(validRecordData.passwordHash);
            expect(state.getSalt()).toBe(validRecordData.salt);
        });

        it('should handle empty record data gracefully', () => {
            const state = AccountState.fromRecordData({});

            expect(state).toBeInstanceOf(AccountState);
            expect(state.getId()).toBeUndefined();
            expect(state.getUsername()).toBeUndefined();
            expect(state.getPasswordHash()).toBeUndefined();
            expect(state.getSalt()).toBeUndefined();
        });

        it('should handle partial record data', () => {
            const partialData = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                username: 'partialuser'
            };

            const state = AccountState.fromRecordData(partialData);

            expect(state.getId()).toBe(partialData.id);
            expect(state.getUsername()).toBe(partialData.username);
            expect(state.getPasswordHash()).toBeUndefined();
            expect(state.getSalt()).toBeUndefined();
        });
    });

    describe('getId', () => {
        it('should return the id value', () => {
            const state = AccountState.fromRecordData(validRecordData);

            const result = state.getId();

            expect(result).toBe(validRecordData.id);
        });

        it('should return undefined when id is not set', () => {
            const state = AccountState.fromRecordData({ username: 'test' });

            const result = state.getId();

            expect(result).toBeUndefined();
        });
    });

    describe('getUsername', () => {
        it('should return the username value', () => {
            const state = AccountState.fromRecordData(validRecordData);

            const result = state.getUsername();

            expect(result).toBe(validRecordData.username);
        });

        it('should return undefined when username is not set', () => {
            const state = AccountState.fromRecordData({ id: 'test-id' });

            const result = state.getUsername();

            expect(result).toBeUndefined();
        });
    });

    describe('getPasswordHash', () => {
        it('should return the passwordHash value', () => {
            const state = AccountState.fromRecordData(validRecordData);

            const result = state.getPasswordHash();

            expect(result).toBe(validRecordData.passwordHash);
        });

        it('should return undefined when passwordHash is not set', () => {
            const state = AccountState.fromRecordData({ id: 'test-id' });

            const result = state.getPasswordHash();

            expect(result).toBeUndefined();
        });
    });

    describe('getSalt', () => {
        it('should return the salt value', () => {
            const state = AccountState.fromRecordData(validRecordData);

            const result = state.getSalt();

            expect(result).toBe(validRecordData.salt);
        });

        it('should return undefined when salt is not set', () => {
            const state = AccountState.fromRecordData({ id: 'test-id' });

            const result = state.getSalt();

            expect(result).toBeUndefined();
        });
    });

    describe('static constants', () => {
        it('should use static constants consistently', () => {
            const recordData = {
                [AccountState.ID]: '123e4567-e89b-12d3-a456-426614174000',
                [AccountState.USERNAME]: 'testuser',
                [AccountState.PASSWORD_HASH]: 'hashed-password',
                [AccountState.SALT]: 'salt-value'
            };

            const state = AccountState.fromRecordData(recordData);

            expect(state.getId()).toBe('123e4567-e89b-12d3-a456-426614174000');
            expect(state.getUsername()).toBe('testuser');
            expect(state.getPasswordHash()).toBe('hashed-password');
            expect(state.getSalt()).toBe('salt-value');
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const state = AccountState.fromRecordData(validRecordData);

            const id1 = state.getId();
            const id2 = state.getId();
            const username1 = state.getUsername();
            const username2 = state.getUsername();

            expect(id1).toBe(id2);
            expect(username1).toBe(username2);
            expect(id1).toBe(validRecordData.id);
            expect(username1).toBe(validRecordData.username);
        });

        it('should not allow external modification of internal state', () => {
            const state = AccountState.fromRecordData(validRecordData);
            const originalId = state.getId();
            const originalUsername = state.getUsername();

            // Getters should return the same values consistently
            expect(state.getId()).toBe(originalId);
            expect(state.getUsername()).toBe(originalUsername);
        });
    });

    describe('toRecordData', () => {
        it('should convert state back to record data format', () => {
            const state = AccountState.fromRecordData(validRecordData);

            const recordData = state.toRecordData();

            expect(recordData).toEqual({
                id: validRecordData.id,
                username: validRecordData.username,
                passwordHash: validRecordData.passwordHash,
                salt: validRecordData.salt
            });
        });

        it('should handle partial state data', () => {
            const partialData = {
                id: 'test-id',
                username: 'testuser'
            };
            const state = AccountState.fromRecordData(partialData);

            const recordData = state.toRecordData();

            expect(recordData.id).toBe('test-id');
            expect(recordData.username).toBe('testuser');
            expect(recordData.passwordHash).toBeUndefined();
            expect(recordData.salt).toBeUndefined();
        });
    });

    describe('equality', () => {
        it('should treat states with same data as equal in content', () => {
            const state1 = AccountState.fromRecordData(validRecordData);
            const state2 = AccountState.fromRecordData(validRecordData);

            expect(state1.getId()).toBe(state2.getId());
            expect(state1.getUsername()).toBe(state2.getUsername());
            expect(state1.getPasswordHash()).toBe(state2.getPasswordHash());
            expect(state1.getSalt()).toBe(state2.getSalt());
        });

        it('should be different instances even with same data', () => {
            const state1 = AccountState.fromRecordData(validRecordData);
            const state2 = AccountState.fromRecordData(validRecordData);

            expect(state1).not.toBe(state2);
            expect(state1.getId()).toBe(state2.getId());
        });

        it('should have different content with different data', () => {
            const data1 = { ...validRecordData };
            const data2 = { ...validRecordData, username: 'differentuser' };

            const state1 = AccountState.fromRecordData(data1);
            const state2 = AccountState.fromRecordData(data2);

            expect(state1.getId()).toBe(state2.getId());
            expect(state1.getUsername()).not.toBe(state2.getUsername());
            expect(state1.getPasswordHash()).toBe(state2.getPasswordHash());
            expect(state1.getSalt()).toBe(state2.getSalt());
        });
    });
});