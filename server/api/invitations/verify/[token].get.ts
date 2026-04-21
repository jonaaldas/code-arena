import defineAuthenticatedEventHandler from "../../../utils/defineAuthHandler"
import { verifyToken } from "../../../utils/verifyToken"

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id
    const token = getRouterParam(event, 'token')

    const row = await verifyToken(token, userId)

    return {
        valid: true,
        scheduledAt: row.timestamp.toISOString(),
    }
})
