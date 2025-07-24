import { Logger } from '@nestjs/common';
import { BaseStreamEvent, EventStreamEnum, EventStreamListener, EventStreamPayload, Projector } from '@backend-monorepo/boilerplate';
import { MovieRatingCreatedEvent } from '@backend-monorepo/domain';
import { MovieRatingMovieRatingsV1ReadmodelWriteRepository } from '../../../outbound/repository/v1/write/movie-rating-movie-ratings-readmodel-write.repository';
import { MovieRatingDocument } from '../../../../application/documents/movie-rating.document';

@Projector()
export class PopulateMovieRatingMovieRatingsProjector {
    private readonly logger = new Logger(PopulateMovieRatingMovieRatingsProjector.name);
    
    constructor(
        private readonly movieRatingsReadmodelWriteRepository: MovieRatingMovieRatingsV1ReadmodelWriteRepository,
    ) {}

    @EventStreamListener(EventStreamEnum.MOVIE_RATING_MOVIE_RATINGS_V1_STREAM)
    public async handleMovieRatingMovieRatingsStreamEvents(@EventStreamPayload() event: BaseStreamEvent): Promise<void> {
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
                    ),
                    event.eventId,
                    event.meta,
                );
                break;
        }
    }
}