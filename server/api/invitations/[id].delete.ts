import { and, eq } from 'drizzle-orm';
import { Result } from 'better-result';
import { db } from '../../utils/db';
import { user_link_invitations } from '../../database/schema';
import defineAuthenticatedEventHandler from '../../utils/defineAuthHandler';

export default defineAuthenticatedEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'id is required' });
    }

    const userId = event.context.user.id;

    const result = await Result.tryPromise({
        try: () =>
            db
                .delete(user_link_invitations)
                .where(and(eq(user_link_invitations.id, id), eq(user_link_invitations.userId, userId))),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    });

    if (result.isErr()) {
        throw createError({ statusCode: 500, statusMessage: result.error });
    }

    return { id };
});
