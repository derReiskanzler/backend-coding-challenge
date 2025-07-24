import { HttpException, HttpStatus } from '@nestjs/common';

export class MovieRatingNotFoundException extends HttpException {
    public name = 'MOVIE_RATING_NOT_FOUND';

    public static withId(id: string): MovieRatingNotFoundException {
        return new MovieRatingNotFoundException(`Movie rating with id: '${id}' not found`, HttpStatus.NOT_FOUND);
    }
}
