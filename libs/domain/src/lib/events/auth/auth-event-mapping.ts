import { UserSignedUpEvent } from './user-signed-up.event';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authEventMapping: Record<string, any> = {
    [UserSignedUpEvent.name]: UserSignedUpEvent,
};
