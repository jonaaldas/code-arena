import defineAuthenticatedEventHandler from "../../utils/defineAuthHandler"

export default defineAuthenticatedEventHandler(async (event) => {
    const token = getRouterParams(event)
    console.log(token)
    return {
        success: true,
    }
})  