import { Test, TestingModule } from '@nestjs/testing';
import { MovieRatingV1WriteRepository } from './movie-rating-write.repository';
import { MovieRating } from '../../../../../domain/aggregates/movie-rating.aggregate';
import { Command } from '@backend-monorepo/boilerplate';

class MockCommand extends Command {
    constructor(public readonly name = 'TestCommand') {
        super();
    }
}

jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    AggregateWriteRepository: class MockAggregateWriteRepository {
        protected saveAggregate = jest.fn();
    },
}));

describe('MovieRatingV1WriteRepository', () => {
    let repository: MovieRatingV1WriteRepository;
    let mockSaveAggregate: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MovieRatingV1WriteRepository],
        }).compile();

        repository = module.get<MovieRatingV1WriteRepository>(MovieRatingV1WriteRepository);
        mockSaveAggregate = (repository as any).saveAggregate;
        
        jest.clearAllMocks();
    });

    describe('save', () => {
        let mockMovieRating: MovieRating;
        let mockCommand: MockCommand;

        beforeEach(() => {
            mockMovieRating = new MovieRating();
            mockCommand = new MockCommand('TestCommand');
        });

        it('should save movie rating successfully', async () => {
            mockSaveAggregate.mockResolvedValue(undefined);

            await repository.save(mockMovieRating, mockCommand);

            expect(mockSaveAggregate).toHaveBeenCalledWith(mockMovieRating, mockCommand);
            expect(mockSaveAggregate).toHaveBeenCalledTimes(1);
        });

        it('should call saveAggregate with correct parameters', async () => {
            mockSaveAggregate.mockResolvedValue(undefined);

            await repository.save(mockMovieRating, mockCommand);

            expect(mockSaveAggregate).toHaveBeenCalledWith(
                expect.any(MovieRating),
                expect.any(Command)
            );
            expect(mockSaveAggregate.mock.calls[0][0]).toBe(mockMovieRating);
            expect(mockSaveAggregate.mock.calls[0][1]).toBe(mockCommand);
        });

        it('should propagate errors from parent saveAggregate method', async () => {
            const testError = new Error('Database connection failed');
            mockSaveAggregate.mockRejectedValue(testError);

            await expect(repository.save(mockMovieRating, mockCommand)).rejects.toThrow(
                'Database connection failed'
            );
            expect(mockSaveAggregate).toHaveBeenCalledWith(mockMovieRating, mockCommand);
        });

        it('should handle multiple consecutive save operations', async () => {
            const movieRating1 = new MovieRating();
            const movieRating2 = new MovieRating();
            const command1 = new MockCommand('Command1');
            const command2 = new MockCommand('Command2');

            mockSaveAggregate.mockResolvedValue(undefined);

            await repository.save(movieRating1, command1);
            await repository.save(movieRating2, command2);

            expect(mockSaveAggregate).toHaveBeenCalledTimes(2);
            expect(mockSaveAggregate).toHaveBeenNthCalledWith(1, movieRating1, command1);
            expect(mockSaveAggregate).toHaveBeenNthCalledWith(2, movieRating2, command2);
        });
    });
});
