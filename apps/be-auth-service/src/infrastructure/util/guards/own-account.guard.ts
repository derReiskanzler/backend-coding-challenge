
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OwnAccountGuard implements CanActivate {
    public async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const { params, user } = context.switchToHttp().getRequest();

        return params.id === user.id;
    }
}
