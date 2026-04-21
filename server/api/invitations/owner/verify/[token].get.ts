import defineAuthenticatedEventHandler from '../../../../utils/defineAuthHandler';
import { verifyAsOwner } from '../../../../utils/verifyToken';

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id;
    const token = getRouterParam(event, 'token');

    const row = await verifyAsOwner(token, userId);

    return {
        valid: true,
        scheduledAt: row.timestamp.toISOString(),
    };
});
