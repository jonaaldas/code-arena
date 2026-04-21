import { desc, eq } from 'drizzle-orm';
import { Result } from 'better-result';
import { db } from '../../utils/db';
import { user_link_invitations, accepted_invitations } from '../../database/schema';
import defineAuthenticatedEventHandler from '../../utils/defineAuthHandler';

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id;

    const result = await Result.tryPromise({
        try: () =>
            db
                .select({
                    id: user_link_invitations.id,
                    link: user_link_invitations.link,
                    sent: user_link_invitations.sent,
                    timestamp: user_link_invitations.timestamp,
                    createdAt: user_link_invitations.createdAt,
                    updatedAt: user_link_invitations.updatedAt,
                    acceptedAt: accepted_invitations.acceptedAt,
                    acceptedBy: accepted_invitations.user_who_accepted,
                })
                .from(user_link_invitations)
                .leftJoin(
                    accepted_invitations,
                    eq(accepted_invitations.invitationId, user_link_invitations.id)
                )
                .where(eq(user_link_invitations.userId, userId))
                .orderBy(desc(user_link_invitations.timestamp)),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    });

    if (result.isErr()) {
        throw createError({ statusCode: 500, statusMessage: result.error });
    }

    const now = Date.now();
    const FIFTEEN_MIN_MS = 15 * 60 * 1000;
    const startsWithin15Min = (scheduledAt: Date) => {
        return Math.abs(scheduledAt.getTime() - now) <= FIFTEEN_MIN_MS;
    };

    return result.value.map((row) => ({
        id: row.id,
        link: row.link,
        sent: row.sent,
        accepted: !!row.acceptedAt,
        acceptedAt: row.acceptedAt ? row.acceptedAt.toISOString() : null,
        acceptedBy: row.acceptedBy ?? null,
        scheduledAt: row.timestamp.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        dueSoon: startsWithin15Min(row.timestamp),
    }));
});
