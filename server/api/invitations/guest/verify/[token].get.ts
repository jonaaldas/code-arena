import defineAuthenticatedEventHandler from '../../../../utils/defineAuthHandler';
import { verifyAsGuest } from '../../../../utils/verifyToken';

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id;
    const token = getRouterParam(event, 'token');

    const row = await verifyAsGuest(token, userId);

    return {
        valid: true,
        scheduledAt: row.timestamp.toISOString(),
    };
});
