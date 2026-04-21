import defineAuthenticatedEventHandler from '../utils/defineAuthHandler';

export default defineAuthenticatedEventHandler(async (event) => {
    const userId = event.context.user.id;
    return {
        userId,
    }
})