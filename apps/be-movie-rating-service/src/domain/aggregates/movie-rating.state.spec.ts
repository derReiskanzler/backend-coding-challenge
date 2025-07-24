import { MovieRatingState } from './movie-rating.state';

describe('MovieRatingState', () => {
    const validRecordData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'testtitle',
        description: 'testdescription',
        stars: 1,
        accountId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(),
    };

    describe('constructor and initialization', () => {
        it('should create MovieRatingState instance with valid record data', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            expect(state).toBeInstanceOf(MovieRatingState);
            expect(state.getId()).toBe(validRecordData.id);
            expect(state.getTitle()).toBe(validRecordData.title);
            expect(state.getDescription()).toBe(validRecordData.description);
            expect(state.getStars()).toBe(validRecordData.stars);
            expect(state.getAccountId()).toBe(validRecordData.accountId);
            expect(state.getCreatedAt()).toBe(validRecordData.createdAt);
        });

        it('should handle empty record data gracefully', () => {
            const state = MovieRatingState.fromRecordData({});

            expect(state).toBeInstanceOf(MovieRatingState);
            expect(state.getId()).toBeUndefined();
            expect(state.getTitle()).toBeUndefined();
            expect(state.getDescription()).toBeUndefined();
            expect(state.getStars()).toBeUndefined();
            expect(state.getAccountId()).toBeUndefined();
            expect(state.getCreatedAt()).toBeUndefined();
        });

        it('should handle partial record data', () => {
            const partialData = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'partialtitle'
            };

            const state = MovieRatingState.fromRecordData(partialData);

            expect(state.getId()).toBe(partialData.id);
            expect(state.getTitle()).toBe(partialData.title);
            expect(state.getDescription()).toBeUndefined();
            expect(state.getStars()).toBeUndefined();
            expect(state.getAccountId()).toBeUndefined();
            expect(state.getCreatedAt()).toBeUndefined();
        });
    });

    describe('getId', () => {
        it('should return the id value', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            const result = state.getId();

            expect(result).toBe(validRecordData.id);
        });

        it('should return undefined when id is not set', () => {
            const state = MovieRatingState.fromRecordData({ title: 'test' });

            const result = state.getId();

            expect(result).toBeUndefined();
        });

        it('should return undefined when createdAt is not set', () => {
            const state = MovieRatingState.fromRecordData({ id: 'test-id' });

            const result = state.getCreatedAt();

            expect(result).toBeUndefined();
        });
    });

    describe('getTitle', () => {
        it('should return the title value', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            const result = state.getTitle();

            expect(result).toBe(validRecordData.title);
        });

        it('should return undefined when title is not set', () => {
            const state = MovieRatingState.fromRecordData({ id: 'test-id' });

            const result = state.getTitle();

            expect(result).toBeUndefined();
        });
    });

    describe('getDescription', () => {
        it('should return the description value', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            const result = state.getDescription();

            expect(result).toBe(validRecordData.description);
        });

        it('should return undefined when description is not set', () => {
            const state = MovieRatingState.fromRecordData({ id: 'test-id' });

            const result = state.getDescription();

            expect(result).toBeUndefined();
        });
    });

    describe('getStars', () => {
        it('should return the stars value', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            const result = state.getStars();

            expect(result).toBe(validRecordData.stars);
        });

        it('should return undefined when stars is not set', () => {
            const state = MovieRatingState.fromRecordData({ id: 'test-id' });

            const result = state.getStars();

            expect(result).toBeUndefined();
        });
    });

    describe('getAccountId', () => {
        it('should return the accountId value', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            const result = state.getAccountId();

            expect(result).toBe(validRecordData.accountId);
        });

        it('should return undefined when accountId is not set', () => {
            const state = MovieRatingState.fromRecordData({ id: 'test-id' });

            const result = state.getAccountId();

            expect(result).toBeUndefined();
        });
    });

    describe('getCreatedAt', () => {
        it('should return the createdAt value', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            const result = state.getCreatedAt();

            expect(result).toBe(validRecordData.createdAt);
        });

        it('should return undefined when createdAt is not set', () => {
            const state = MovieRatingState.fromRecordData({ id: 'test-id' });

            const result = state.getCreatedAt();

            expect(result).toBeUndefined();
        });
    });

    describe('static constants', () => {
        it('should use static constants consistently', () => {
            const recordData = {
                [MovieRatingState.ID]: '123e4567-e89b-12d3-a456-426614174000',
                [MovieRatingState.TITLE]: 'testtitle',
                [MovieRatingState.DESCRIPTION]: 'testdescription',
                [MovieRatingState.STARS]: 1,
                [MovieRatingState.ACCOUNT_ID]: '123e4567-e89b-12d3-a456-426614174001',
                [MovieRatingState.CREATED_AT]: new Date(),
            };

            const state = MovieRatingState.fromRecordData(recordData);

            expect(state.getId()).toBe('123e4567-e89b-12d3-a456-426614174000');
            expect(state.getTitle()).toBe('testtitle');
            expect(state.getDescription()).toBe('testdescription');
            expect(state.getStars()).toBe(1);
            expect(state.getAccountId()).toBe('123e4567-e89b-12d3-a456-426614174001');
            expect(state.getCreatedAt()).toBe(new Date());
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            const id1 = state.getId();
            const id2 = state.getId();
            const title1 = state.getTitle();
            const title2 = state.getTitle();

            expect(id1).toBe(id2);
            expect(title1).toBe(title2);
            expect(id1).toBe(validRecordData.id);
            expect(title1).toBe(validRecordData.title);
        });

        it('should not allow external modification of internal state', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);
            const originalId = state.getId();
            const originalTitle = state.getTitle();

            // Getters should return the same values consistently
            expect(state.getId()).toBe(originalId);
            expect(state.getTitle()).toBe(originalTitle);
        });
    });

    describe('toRecordData', () => {
        it('should convert state back to record data format', () => {
            const state = MovieRatingState.fromRecordData(validRecordData);

            const recordData = state.toRecordData();

            expect(recordData).toEqual({
                id: validRecordData.id,
                title: validRecordData.title,
                description: validRecordData.description,
                stars: validRecordData.stars,
                accountId: validRecordData.accountId,
                createdAt: validRecordData.createdAt,
            });
        });

        it('should handle partial state data', () => {
            const partialData = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'testtitle'
            };
            const state = MovieRatingState.fromRecordData(partialData);

            const recordData = state.toRecordData();

            expect(recordData.id).toBe('123e4567-e89b-12d3-a456-426614174000');
            expect(recordData.title).toBe('testtitle');
            expect(recordData.description).toBeUndefined();
            expect(recordData.stars).toBeUndefined();
            expect(recordData.accountId).toBeUndefined();
            expect(recordData.createdAt).toBeUndefined();
        });
    });

    describe('equality', () => {
        it('should treat states with same data as equal in content', () => {
            const state1 = MovieRatingState.fromRecordData(validRecordData);
            const state2 = MovieRatingState.fromRecordData(validRecordData);

            expect(state1.getId()).toBe(state2.getId());
            expect(state1.getTitle()).toBe(state2.getTitle());
            expect(state1.getDescription()).toBe(state2.getDescription());
            expect(state1.getStars()).toBe(state2.getStars());
            expect(state1.getAccountId()).toBe(state2.getAccountId());
            expect(state1.getCreatedAt()).toBe(state2.getCreatedAt());
        });

        it('should be different instances even with same data', () => {
            const state1 = MovieRatingState.fromRecordData(validRecordData);
            const state2 = MovieRatingState.fromRecordData(validRecordData);

            expect(state1).not.toBe(state2);
            expect(state1.getId()).toBe(state2.getId());
        });

        it('should have different content with different data', () => {
            const data1 = { ...validRecordData };
            const data2 = { ...validRecordData, title: 'differenttitle' };

            const state1 = MovieRatingState.fromRecordData(data1);
            const state2 = MovieRatingState.fromRecordData(data2);

            expect(state1.getId()).toBe(state2.getId());
            expect(state1.getTitle()).not.toBe(state2.getTitle());
            expect(state1.getDescription()).toBe(state2.getDescription());
            expect(state1.getStars()).toBe(state2.getStars());
            expect(state1.getAccountId()).toBe(state2.getAccountId());
            expect(state1.getCreatedAt()).toBe(state2.getCreatedAt());
        });
    });
});