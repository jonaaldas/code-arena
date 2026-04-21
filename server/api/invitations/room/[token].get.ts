import defineAuthenticatedEventHandler from '../../../utils/defineAuthHandler';
import { verifyRoomAccess } from '../../../utils/verifyToken';

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id;
    const token = getRouterParam(event, 'token');

    const row = await verifyRoomAccess(token, userId);

    return {
        valid: true,
        role: row.role,
        scheduledAt: row.timestamp.toISOString(),
    };
});
