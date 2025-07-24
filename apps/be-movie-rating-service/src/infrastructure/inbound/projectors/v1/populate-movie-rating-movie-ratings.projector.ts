/* eslint-disable no-case-declarations */
import { Logger } from '@nestjs/common';
import { BaseStreamEvent, EventStreamEnum, EventStreamListener, EventStreamPayload, Projector } from '@backend-monorepo/boilerplate';
import { MovieRatingCreatedEvent, MovieRatingDeletedEvent, MovieRatingDescriptionUpdatedEvent, MovieRatingStarsUpdatedEvent, MovieRatingTitleUpdatedEvent } from '@backend-monorepo/domain';
import { MovieRatingV1ReadmodelWriteRepository } from '../../../outbound/repository/v1/write/movie-rating-readmodel-write.repository';
import { MovieRatingDocument } from '../../../../application/documents/movie-rating.document';
import { MovieRatingV1ReadmodelReadRepository } from '../../../outbound/repository/v1/read/movie-rating-readmodel-read.repository';

@Projector()
export class PopulateMovieRatingMovieRatingsProjector {
    private readonly logger = new Logger(PopulateMovieRatingMovieRatingsProjector.name);
    
    constructor(
        private readonly movieRatingsReadmodelWriteRepository: MovieRatingV1ReadmodelWriteRepository,
        private readonly movieRatingReadmodelReadRepository: MovieRatingV1ReadmodelReadRepository,
    ) {}

    @EventStreamListener(EventStreamEnum.MOVIE_RATING_MOVIE_RATINGS_V1_STREAM)
    public async handleMovieRatingMovieRatingsStreamEvents(@EventStreamPayload() event: BaseStreamEvent): Promise<void> {
        let movieRating = null;

        switch (event.eventName) {
            case MovieRatingCreatedEvent.name:
                this.logger.log(`Received: '${event.eventName}'`);
                await this.movieRatingsReadmodelWriteRepository.upsert(
                    new MovieRatingDocument(
                        event.payload['id'],
                        event.payload['title'],
                        event.payload['description'],
                        event.payload['stars'],
                        event.payload['accountId'],
                        event.payload['createdAt'],
                    ),
                    event.eventId,
                    event.meta,
                );
                break;
            case MovieRatingTitleUpdatedEvent.name:
                this.logger.log(`Received: '${event.eventName}'`);
                movieRating = await this.movieRatingReadmodelReadRepository.getById(event.payload['id']);
                if (movieRating) {
                    await this.movieRatingsReadmodelWriteRepository.upsert(
                        movieRating.with({
                            [MovieRatingDocument.TITLE]: event.payload['title'],
                        }),
                        event.eventId,
                        event.meta,
                    );
                }
                break;
            case MovieRatingDescriptionUpdatedEvent.name:
                this.logger.log(`Received: '${event.eventName}'`);
                movieRating = await this.movieRatingReadmodelReadRepository.getById(event.payload['id']);
                if (movieRating) {
                    await this.movieRatingsReadmodelWriteRepository.upsert(
                        movieRating.with({
                            [MovieRatingDocument.DESCRIPTION]: event.payload['description'],
                        }),
                        event.eventId,
                        event.meta,
                    );
                }
                break;
            case MovieRatingStarsUpdatedEvent.name:
                this.logger.log(`Received: '${event.eventName}'`);
                movieRating = await this.movieRatingReadmodelReadRepository.getById(event.payload['id']);
                if (movieRating) {
                    await this.movieRatingsReadmodelWriteRepository.upsert(
                        movieRating.with({
                            [MovieRatingDocument.STARS]: event.payload['stars'],
                        }),
                        event.eventId,
                        event.meta,
                    );
                }
                break;
            case MovieRatingDeletedEvent.name:
                this.logger.log(`Received: '${event.eventName}'`);
                await this.movieRatingsReadmodelWriteRepository.deleteById(event.payload['id'], event.eventId);
                break;
        }
    }
}