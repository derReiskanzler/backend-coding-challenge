
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MovieRatingV1ReadmodelReadRepository } from '../../outbound/repository/v1/read/movie-rating-readmodel-read.repository';
import { MovieRatingDocumentNotFoundException } from '../../../application/exceptions/movie-rating-document-not-found.exception';

@Injectable()
export class OwnMovieRatingGuard implements CanActivate {
    constructor(
        private readonly movieRatingReadRepository: MovieRatingV1ReadmodelReadRepository,
    ) {}
    
    public async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const { params, user } = context.switchToHttp().getRequest();

        const movieRating = await this.movieRatingReadRepository.getById(params.id);
        if (movieRating && movieRating.accountId !== user.id) {
            return false;
        }

        if (!movieRating) {
            throw MovieRatingDocumentNotFoundException.withId(params.id);
        }

        return true;
    }
}
