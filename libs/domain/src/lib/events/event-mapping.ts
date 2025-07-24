import { authEventMapping } from './auth/auth-event-mapping';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const eventMapping: Record<string, any> = {
    ...authEventMapping,
};