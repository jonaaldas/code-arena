import defineAuthenticatedEventHandler from "~~/server/utils/defineAuthHandler"
import { db } from '../../../utils/db'
import { user_link_invitations, accepted_invitations } from '../../../database/schema'
import { eq, like } from 'drizzle-orm'
import { Result } from 'better-result'

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id
    const token = getRouterParam(event, 'token')

    if (!token) {
        throw createError({ statusCode: 400, statusMessage: 'Missing token' })
    }

    const lookup = await Result.tryPromise({
        try: () =>
            db
                .select({
                    id: user_link_invitations.id,
                    ownerId: user_link_invitations.userId,
                    timestamp: user_link_invitations.timestamp,
                })
                .from(user_link_invitations)
                .where(like(user_link_invitations.link, `%/invite/${token}`))
                .limit(1),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    })

    if (lookup.isErr()) {
        throw createError({ statusCode: 500, statusMessage: lookup.error })
    }

    const [row] = lookup.value
    if (!row) {
        throw createError({ statusCode: 404, statusMessage: 'Invalid invitation token' })
    }

    if (row.ownerId === userId) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot accept your own invitation' })
    }

    const GRACE_MS = 15 * 60 * 1000
    if (row.timestamp.getTime() + GRACE_MS < Date.now()) {
        throw createError({ statusCode: 410, statusMessage: 'This invitation has expired' })
    }

    const existing = await Result.tryPromise({
        try: () =>
            db
                .select({ id: accepted_invitations.id })
                .from(accepted_invitations)
                .where(eq(accepted_invitations.invitationId, row.id))
                .limit(1),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    })

    if (existing.isErr()) {
        throw createError({ statusCode: 500, statusMessage: existing.error })
    }

    if (existing.value.length > 0) {
        return { id: existing.value[0]!.id, alreadyAccepted: true }
    }

    const id = crypto.randomUUID()
    const now = new Date()

    const insertResult = await Result.tryPromise({
        try: () =>
            db.insert(accepted_invitations).values({
                id,
                invitationId: row.id,
                user_who_accepted: userId,
                user_who_sent: row.ownerId,
                acceptedAt: now,
                createdAt: now,
                updatedAt: now,
            }),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    })

    if (insertResult.isErr()) {
        throw createError({ statusCode: 500, statusMessage: insertResult.error })
    }

    return { id, alreadyAccepted: false }
})
