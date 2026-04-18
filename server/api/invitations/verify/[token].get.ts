import defineAuthenticatedEventHandler from "../../../utils/defineAuthHandler"
import { db } from '../../../utils/db'
import { user_link_invitations } from '../../../database/schema'
import { eq } from "drizzle-orm"
import { Result } from 'better-result'

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id
    const token = getRouterParams(event).token
    const host = event.node.req.headers.host
    const url = `http://${host}/invite/${token}`

    const res = await Result.tryPromise({
        try: () =>
            db.select({
                userId: user_link_invitations.userId,
                timestamp: user_link_invitations.timestamp,
            })
                .from(user_link_invitations)
                .where(eq(user_link_invitations.link, url))
                .limit(1),
        catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
    })

    if (res.isErr()) {
        throw createError({ statusCode: 500, statusMessage: res.error })
    }

    const [row] = res.value

    if (!row) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid invitation token' })
    }

    if (userId === row.userId) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot accept your own invitation' })
    }

    if (row.timestamp < new Date()) {
        throw createError({ statusCode: 400, statusMessage: 'Invitation has expired' })
    }

    if (row.timestamp > new Date()) {
        throw createError({ statusCode: 400, statusMessage: 'Invitation is not active yet' })
    }




    return {
        success: true,
    }
})
