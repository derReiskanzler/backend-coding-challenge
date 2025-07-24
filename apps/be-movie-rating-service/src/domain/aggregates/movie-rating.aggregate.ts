import {
    AccountId,
    Description,
    MovieRatingCreatedEvent,
    MovieRatingId,
    MovieRatingStars,
    MovieRatingTitleUpdatedEvent,
    Title,
} from '@backend-monorepo/domain';
import { AggregateId, AggregateRoot } from '@backend-monorepo/boilerplate';
import { MovieRatingState } from './movie-rating.state';

export class MovieRating extends AggregateRoot {
    protected override state: MovieRatingState;

    public getAggregateId(): AggregateId {
        return AggregateId.fromString(this.state.getId().toString());
    }

    public override getState(): MovieRatingState {
        return this.state;
    }

    public static create(
        id: MovieRatingId,
        title: Title,
        description: Description,
        stars: MovieRatingStars,
        accountId: AccountId,
    ): MovieRating {
        const movieRating = new MovieRating();
        movieRating.recordThat(
            MovieRatingCreatedEvent.create(
                id.toString(),
                title.toString(),
                description.toString(),
                stars.toNumber(),
                accountId.toString(),
            ),
        );

        return movieRating;
    }

    public onMovieRatingCreatedEvent(event: MovieRatingCreatedEvent): void {
        this.state = MovieRatingState.fromRecordData({
            [MovieRatingState.ID]: event.getId(),
            [MovieRatingState.TITLE]: event.getTitle(),
            [MovieRatingState.DESCRIPTION]: event.getDescription(),
            [MovieRatingState.STARS]: event.getStars(),
            [MovieRatingState.ACCOUNT_ID]: event.getAccountId(),
            [MovieRatingState.CREATED_AT]: event.getCreatedAt(),
        });
    }

    public updateTitle(title: Title): void {
        if (title.equals(Title.fromString(this.state.getTitle()))) {
            return;
        }

        this.recordThat(
            MovieRatingTitleUpdatedEvent.create(this.state.getId().toString(), title.toString()),
        );
    }

    public onMovieRatingTitleUpdatedEvent(event: MovieRatingTitleUpdatedEvent): void {
        this.state = this.state.with({
            title: event.getTitle(),
        });
    }
}