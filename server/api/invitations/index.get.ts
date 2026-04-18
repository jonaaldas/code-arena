import { desc, eq } from 'drizzle-orm';
import { Result } from 'better-result';
import { db } from '../../utils/db';
import { user_link_invitations } from '../../database/schema';
import defineAuthenticatedEventHandler from '../../utils/defineAuthHandler';

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id;

    const result = await Result.tryPromise({
        try: () =>
            db
                .select()
                .from(user_link_invitations)
                .where(eq(user_link_invitations.userId, userId))
                .orderBy(desc(user_link_invitations.timestamp)),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    });

    if (result.isErr()) {
        throw createError({ statusCode: 500, statusMessage: result.error });
    }

    return result.value.map((row) => ({
        id: row.id,
        link: row.link,
        sent: row.sent,
        scheduledAt: row.timestamp.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    }));
});
