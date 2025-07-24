import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { GetMovieRatingV1Action } from './get-movie-rating.action';
import { AUTH_SERVICE, AuthenticatedUser, QueryBusService } from '@backend-monorepo/boilerplate';
import { MovieRatingId } from '@backend-monorepo/domain';
import { GetMovieRatingQuery } from '../../../../../../application/use-cases/get-movie-rating/get-movie-rating.query';
import { MovieRatingDocument } from '../../../../../../application/documents/movie-rating.document';
import { of } from 'rxjs';

describe('GetMovieRatingV1Action', () => {
    let action: GetMovieRatingV1Action;
    let mockQueryBus: jest.Mocked<QueryBusService>;
    let mockResponse: jest.Mocked<Response>;

    const mockUser: AuthenticatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
    };
    
    beforeEach(async () => {
        const mockQueryBusService = {
            dispatch: jest.fn(),
        };

        const mockAuthService = {
            send: jest.fn().mockReturnValue(of(mockUser)),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GetMovieRatingV1Action],
            providers: [
                {
                    provide: QueryBusService,
                    useValue: mockQueryBusService,
                },
                {
                    provide: AUTH_SERVICE,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        action = module.get<GetMovieRatingV1Action>(GetMovieRatingV1Action);
        mockQueryBus = module.get(QueryBusService);

        mockResponse = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        jest.clearAllMocks();
    });

    describe('index', () => {
        const mockMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';
        const mockMovieRating = new MovieRatingDocument(
            mockMovieRatingId,
            'testtitle',
            'testdescription',
            5,
            '123e4567-e89b-12d3-a456-426614174000',
            new Date(),
        );

        const validQuery = new GetMovieRatingQuery(
            MovieRatingId.fromString(mockMovieRatingId),
        );

        it('should get movie rating successfully', async () => {
            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            await action.index(validQuery.getId().toString());

            expect(mockQueryBus.dispatch).toHaveBeenCalledWith(validQuery);
            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should create GetMovieRatingQuery with correct parameters', async () => {
            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            await action.index(validQuery.getId().toString());

            const dispatchedQuery = mockQueryBus.dispatch.mock.calls[0][0] as GetMovieRatingQuery;
            expect(dispatchedQuery).toBeInstanceOf(GetMovieRatingQuery);
            expect(dispatchedQuery.getId().toString()).toBe(mockMovieRatingId);
        });

        it('should handle different valid movie rating ids', async () => {
            const testCases = [
                { id: '123e4567-e89b-12d3-a456-426614174000' },
                { id: '123e4567-e89b-12d3-a456-426614174001' },
                { id: '123e4567-e89b-12d3-a456-426614174002' },
            ];

            for (const testCase of testCases) {
                const validQuery = new GetMovieRatingQuery(
                    MovieRatingId.fromString(testCase.id),
                );

                await action.index(validQuery.getId().toString());

                const dispatchedQuery = mockQueryBus.dispatch.mock.calls[
                    mockQueryBus.dispatch.mock.calls.length - 1
                ][0] as GetMovieRatingQuery;
                expect(dispatchedQuery.getId().toString()).toBe(testCase.id);
            }
        });

        it('should propagate errors from query bus', async () => {
            const errorMsg = 'Error getting movie rating';
            mockQueryBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validQuery.getId().toString())).rejects.toThrow(
                errorMsg
            );

            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(1);
            expect(mockResponse.setHeader).not.toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });

    describe('response handling', () => {
        const mockMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';
        const mockMovieRating = new MovieRatingDocument(
            mockMovieRatingId,
            'testtitle',
            'testdescription',
            5,
            '123e4567-e89b-12d3-a456-426614174000',
            new Date(),
        );

        const validQuery = new GetMovieRatingQuery(
            MovieRatingId.fromString(mockMovieRatingId),
        );

        it('should return void from index method', async () => {
            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            const result = await action.index(validQuery.getId().toString());

            expect(result).toBe(mockMovieRating);
        });
    });

    it('should handle multiple consecutive requests', async () => {
        const movieRatingIds = ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'];

        for (let i = 0; i < movieRatingIds.length; i++) {
            const validQuery = new GetMovieRatingQuery(
                MovieRatingId.fromString(movieRatingIds[i]),
            );

            await action.index(validQuery.getId().toString());

            expect(mockQueryBus.dispatch).toHaveBeenCalledWith(validQuery);
            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(i + 1);
        }

        expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(3);
    });
});
