import { applyDecorators, Controller } from '@nestjs/common';

/**
 * Decorator to mark class as process manager
*/
export const ProcessManager = () => {
    return applyDecorators(Controller());
}