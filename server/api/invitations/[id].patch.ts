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

    const body = await readBody(event);
    const { link, scheduledAt } = body as { link?: string; scheduledAt?: string };
    const userId = event.context.user.id;

    if (link === undefined && scheduledAt === undefined) {
        throw createError({ statusCode: 400, statusMessage: 'Nothing to update' });
    }

    let scheduledDate: Date | undefined;
    if (scheduledAt !== undefined) {
        scheduledDate = new Date(scheduledAt);
        if (Number.isNaN(scheduledDate.getTime())) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid scheduledAt' });
        }
    }

    const existingResult = await Result.tryPromise({
        try: () =>
            db
                .select()
                .from(user_link_invitations)
                .where(and(eq(user_link_invitations.id, id), eq(user_link_invitations.userId, userId)))
                .limit(1),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    });

    if (existingResult.isErr()) {
        throw createError({ statusCode: 500, statusMessage: existingResult.error });
    }

    const existing = existingResult.value[0];
    if (!existing) {
        throw createError({ statusCode: 404, statusMessage: 'Invitation not found' });
    }

    if (link !== undefined && link !== existing.link && existing.sent) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Cannot edit link after invitation has been sent',
        });
    }

    const updateResult = await Result.tryPromise({
        try: () =>
            db
                .update(user_link_invitations)
                .set({
                    ...(link !== undefined ? { link } : {}),
                    ...(scheduledDate ? { timestamp: scheduledDate } : {}),
                    updatedAt: new Date(),
                })
                .where(and(eq(user_link_invitations.id, id), eq(user_link_invitations.userId, userId))),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    });

    if (updateResult.isErr()) {
        throw createError({ statusCode: 500, statusMessage: updateResult.error });
    }

    return { id };
});
