import defineAuthenticatedEventHandler from "../../../utils/defineAuthHandler"
import { db } from '../../../utils/db'
import { user_link_invitations } from '../../../database/schema'
import { like } from "drizzle-orm"
import { Result } from 'better-result'

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id
    const token = getRouterParam(event, 'token')

    if (!token) {
        throw createError({ statusCode: 400, statusMessage: 'Missing token' })
    }

    const res = await Result.tryPromise({
        try: () =>
            db.select({
                userId: user_link_invitations.userId,
                timestamp: user_link_invitations.timestamp,
            })
                .from(user_link_invitations)
                .where(like(user_link_invitations.link, `%/invite/${token}`))
                .limit(1),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    })

    if (res.isErr()) {
        throw createError({ statusCode: 500, statusMessage: res.error })
    }

    const [row] = res.value

    if (!row) {
        throw createError({ statusCode: 404, statusMessage: 'Invalid invitation token' })
    }

    if (userId === row.userId) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot accept your own invitation' })
    }

    const GRACE_MS = 15 * 60 * 1000; // 15 min grace after scheduled time
    if (row.timestamp.getTime() + GRACE_MS < Date.now()) {
        throw createError({ statusCode: 410, statusMessage: 'This invitation has expired' })
    }


    return {
        valid: true,
        scheduledAt: row.timestamp.toISOString(),
    }
})
