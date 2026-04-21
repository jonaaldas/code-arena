import defineAuthenticatedEventHandler from "~~/server/utils/defineAuthHandler"
import { db } from '../../../utils/db'
import { accepted_invitations } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { Result } from 'better-result'
import { verifyToken } from '../../../utils/verifyToken'

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id
    const token = getRouterParam(event, 'token')

    const row = await verifyToken(token, userId)

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
