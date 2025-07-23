import { applyDecorators, Controller } from '@nestjs/common';

/**
 * Decorator to mark class as projector
*/
export const Projector = () => {
    return applyDecorators(Controller());
}