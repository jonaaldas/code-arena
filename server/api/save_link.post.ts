import { db } from '../utils/db'
import { user_link_invitations } from '../database/schema'
import defineAuthenticatedEventHandler from '../utils/defineAuthHandler';
import { Result } from 'better-result'

export default defineAuthenticatedEventHandler(async (event) => {
    const body = await readBody(event);
    const { link, scheduledAt } = body as { link?: string; scheduledAt?: string };
    const userId = event.context.user.id;

    if (!link || !scheduledAt) {
        throw createError({ statusCode: 400, statusMessage: 'link and scheduledAt are required' });
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid scheduledAt' });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    const result = await Result.tryPromise({
        try: () =>
            db.insert(user_link_invitations).values({
                id,
                userId,
                link,
                timestamp: scheduledDate,
                createdAt: now,
                updatedAt: now,
            }),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    });

    if (result.isErr()) {
        throw createError({ statusCode: 500, statusMessage: result.error });
    }

    return {
        id,
        link,
        scheduledAt: scheduledDate.toISOString(),
    };
});
