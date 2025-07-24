import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CreateMovieRatingV1Action } from './create-movie-rating.action';
import { AuthenticatedUser, CommandBusService, AUTH_SERVICE } from '@backend-monorepo/boilerplate';
import { Title, Description, MovieRatingStars, AccountId } from '@backend-monorepo/domain';
import { CreateMovieRatingDto } from '../../../dtos/request/create-movie-rating.dto';
import { CreateMovieRatingCommand } from '../../../../../../application/use-cases/create-movie-rating/create-movie-rating.command';
import { of } from 'rxjs';

describe('CreateMovieRatingV1Action', () => {
    let action: CreateMovieRatingV1Action;
    let mockCommandBus: jest.Mocked<CommandBusService>;
    let mockResponse: jest.Mocked<Response>;

    const mockUser: AuthenticatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
    };

    beforeEach(async () => {
        const mockCommandBusService = {
            dispatch: jest.fn(),
        };

        const mockAuthService = {
            send: jest.fn().mockReturnValue(of(mockUser)),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CreateMovieRatingV1Action],
            providers: [
                {
                    provide: CommandBusService,
                    useValue: mockCommandBusService,
                },
                {
                    provide: AUTH_SERVICE,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        action = module.get<CreateMovieRatingV1Action>(CreateMovieRatingV1Action);
        mockCommandBus = module.get(CommandBusService);

        mockResponse = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        jest.clearAllMocks();
    });

    describe('index', () => {
        const validDto: CreateMovieRatingDto = {
            title: 'testtitle',
            description: 'testdescription',
            stars: 5,
        };

        const mockMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';

        it('should create movie rating successfully', async () => {
            mockCommandBus.dispatch.mockResolvedValue(mockMovieRatingId);

            await action.index(mockUser, validDto, mockResponse);

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(
                expect.any(CreateMovieRatingCommand)
            );
            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

            expect(mockResponse.setHeader).toHaveBeenCalledWith('id', mockMovieRatingId);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Movie rating created successfully'
            });
        });

        it('should create CreateMovieRatingCommand with correct parameters', async () => {
            mockCommandBus.dispatch.mockResolvedValue(mockMovieRatingId);

            await action.index(mockUser, validDto, mockResponse);

            const dispatchedCommand = mockCommandBus.dispatch.mock.calls[0][0] as CreateMovieRatingCommand;
            expect(dispatchedCommand).toBeInstanceOf(CreateMovieRatingCommand);
            expect(dispatchedCommand.getTitle()).toBeInstanceOf(Title);
            expect(dispatchedCommand.getDescription()).toBeInstanceOf(Description);
            expect(dispatchedCommand.getStars()).toBeInstanceOf(MovieRatingStars);
            expect(dispatchedCommand.getAccountId()).toBeInstanceOf(AccountId);
            expect(dispatchedCommand.getTitle().toString()).toBe('testtitle');
            expect(dispatchedCommand.getDescription().toString()).toBe('testdescription');
            expect(dispatchedCommand.getStars().toNumber()).toBe(5);
            expect(dispatchedCommand.getAccountId().toString()).toBe('123e4567-e89b-12d3-a456-426614174000');
        });

        it('should set response headers and status correctly', async () => {
            const customMovieRatingId = '987e4567-e89b-12d3-a456-426514174999';
            mockCommandBus.dispatch.mockResolvedValue(customMovieRatingId);

            await action.index(mockUser, validDto, mockResponse);

            expect(mockResponse.setHeader).toHaveBeenCalledWith('id', customMovieRatingId);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Movie rating created successfully'
            });
        });

        it('should handle different valid titles, descriptions, stars and accountIds', async () => {
            const testCases = [
                { title: 'testtitle', description: 'testdescription', stars: 5, accountId: '123e4567-e89b-12d3-a456-426614174000' },
                { title: 'testtitle2', description: 'testdescription2', stars: 4, accountId: '123e4567-e89b-12d3-a456-426614174000' },
                { title: 'testtitle3', description: 'testdescription3', stars: 3, accountId: '123e4567-e89b-12d3-a456-426614174000' },
            ];

            for (const testCase of testCases) {
                mockCommandBus.dispatch.mockResolvedValue(mockMovieRatingId);

                await action.index(mockUser, testCase, mockResponse);

                const dispatchedCommand = mockCommandBus.dispatch.mock.calls[
                    mockCommandBus.dispatch.mock.calls.length - 1
                ][0] as CreateMovieRatingCommand;
                expect(dispatchedCommand.getTitle().toString()).toBe(testCase.title);
                expect(dispatchedCommand.getDescription().toString()).toBe(testCase.description);
                expect(dispatchedCommand.getStars().toNumber()).toBe(testCase.stars);
                expect(dispatchedCommand.getAccountId().toString()).toBe(testCase.accountId);
            }
        });

        it('should propagate errors from command bus', async () => {
            const errorMsg = 'Error creating movie rating';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(mockUser, validDto, mockResponse)).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
            expect(mockResponse.setHeader).not.toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        });

        it('should not call response methods when command fails', async () => {
            mockCommandBus.dispatch.mockRejectedValue(new Error('Command failed'));

            try {
                await action.index(mockUser, validDto, mockResponse);
            } catch (error) {
                // Expected to throw
            }

            expect(mockResponse.setHeader).not.toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });

    describe('response handling', () => {
        const testMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';
        const validDto: CreateMovieRatingDto = {
            title: 'testtitle',
            description: 'testdescription',
            stars: 5,
        };

        it('should return void from index method', async () => {
            mockCommandBus.dispatch.mockResolvedValue(testMovieRatingId);

            const result = await action.index(mockUser, validDto, mockResponse);

            expect(result).toBeUndefined();
        });
    });

    it('should handle multiple consecutive requests', async () => {
        const requests = [
            { title: 'testtitle', description: 'testdescription', stars: 5 },
            { title: 'testtitle2', description: 'testdescription2', stars: 4 },
            { title: 'testtitle3', description: 'testdescription3', stars: 3 },
        ];
        const movieRatingIds = ['id-1', 'id-2', 'id-3'];

        for (let i = 0; i < requests.length; i++) {
            mockCommandBus.dispatch.mockResolvedValue(movieRatingIds[i]);

            await action.index(mockUser, requests[i], mockResponse);

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(CreateMovieRatingCommand));
            expect(mockResponse.setHeader).toHaveBeenCalledWith('id', movieRatingIds[i]);
        }

        expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        expect(mockResponse.setHeader).toHaveBeenCalledTimes(3);
        expect(mockResponse.status).toHaveBeenCalledTimes(3);
        expect(mockResponse.json).toHaveBeenCalledTimes(3);
    });
});
