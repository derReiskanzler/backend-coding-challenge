import { HttpException, HttpStatus } from '@nestjs/common';

export class MovieRatingDocumentNotFoundException extends HttpException {
    public name = 'MOVIE_RATING_DOCUMENT_NOT_FOUND';

    public static withId(id: string): MovieRatingDocumentNotFoundException {
        return new MovieRatingDocumentNotFoundException(`Movie rating document with id: '${id}' not found`, HttpStatus.NOT_FOUND);
    }
}
