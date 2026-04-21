import { eq } from 'drizzle-orm';
import { Result } from 'better-result';
import defineAuthenticatedEventHandler from '../../../utils/defineAuthHandler';
import { db } from '../../../utils/db';
import { accepted_invitations } from '../../../database/schema';
import { verifyRoomAccess } from '../../../utils/verifyToken';

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id;
    const token = getRouterParam(event, 'token');

    const row = await verifyRoomAccess(token, userId);

    if (row.role === 'owner') {
        return {
            valid: true,
            role: row.role,
            hasAccepted: true,
            scheduledAt: row.timestamp.toISOString(),
        };
    }

    const accepted = await Result.tryPromise({
        try: () =>
            db
                .select({ id: accepted_invitations.id })
                .from(accepted_invitations)
                .where(eq(accepted_invitations.invitationId, row.id))
                .limit(1),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    });

    if (accepted.isErr()) {
        throw createError({ statusCode: 500, statusMessage: accepted.error });
    }

    return {
        valid: true,
        role: row.role,
        hasAccepted: accepted.value.length > 0,
        scheduledAt: row.timestamp.toISOString(),
    };
});
