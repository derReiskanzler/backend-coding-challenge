import { UserSignedUpEvent } from './user-signed-up.event';
import { UsernameUpdatedEvent } from './username-updated.event';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authEventMapping: Record<string, any> = {
    [UserSignedUpEvent.name]: UserSignedUpEvent,
    [UsernameUpdatedEvent.name]: UsernameUpdatedEvent,
};
